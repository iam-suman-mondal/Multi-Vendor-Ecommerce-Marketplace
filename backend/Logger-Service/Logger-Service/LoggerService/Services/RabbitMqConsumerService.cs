using LoggerService.Models;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace LoggerService.Services
{
    public class RabbitMqConsumerService : BackgroundService
    {

        private readonly FileLoggerService _fileLoggerService;
        private IConnection _connection;
        private IChannel _channel;


        public RabbitMqConsumerService(
            FileLoggerService fileLoggerService)
        {
            _fileLoggerService = fileLoggerService;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            var factory = new ConnectionFactory
            {
                HostName = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost",
                UserName = Environment.GetEnvironmentVariable("RABBITMQ_USER") ?? "guest",
                Password = Environment.GetEnvironmentVariable("RABBITMQ_PASS") ?? "guest"
            };

            _connection = await factory.CreateConnectionAsync();

            _channel = await _connection.CreateChannelAsync();

            await _channel.QueueDeclareAsync(
                queue: "central-logs",
                durable: true,
                exclusive: false,
                autoDelete: false
            );

            var consumer =
                new AsyncEventingBasicConsumer(_channel);

            consumer.ReceivedAsync += async (sender, args) =>
            {
                try
                {
                    byte[] body = args.Body.ToArray();

                    string message =
                        Encoding.UTF8.GetString(body);



                    LogMessage logMessage =
                        JsonSerializer.Deserialize<LogMessage>(
                            message, new JsonSerializerOptions
                            {
                                PropertyNameCaseInsensitive = true
                            }
                        );

                    await _fileLoggerService
                        .WriteLogAsync(logMessage);

                    await _channel.BasicAckAsync(
                        args.DeliveryTag,
                        false
                    );
                }
                catch (Exception ex)
                {
                    Console.WriteLine(
                        $"Error processing log: {ex.Message}"
                    );
                }
            };

            await _channel.BasicConsumeAsync(
                queue: "central-logs",
                autoAck: false,
                consumer: consumer
            );

            await Task.Delay(
                Timeout.Infinite,
                stoppingToken
            );
        }
    }

}

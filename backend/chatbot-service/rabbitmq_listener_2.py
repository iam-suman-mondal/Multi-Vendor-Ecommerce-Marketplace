#pip install pika
#Most common/simple RabbitMQ library for Python

import json
import pika

from knowledge_builder import (
    sync_product,
    delete_product
)

from dotenv import load_dotenv

load_dotenv()


# =====================================================
# RabbitMQ Configuration
# =====================================================

RABBITMQ_HOST = "localhost"
RABBITMQ_PORT = 5672

QUEUE_NAME = "ai.product.events"


# =====================================================
# Handle Product Event
# =====================================================

def handle_product_event(message):

    try:

        event = json.loads(message)

        event_type = event.get("eventType")
        product_id = event.get("productId")


        print("\n================================")
        print("RabbitMQ Product Event")
        print("================================")

        print("Event Type:", event_type)
        print("Product ID:", product_id)


        # ---------------------------------------------
        # PRODUCT CREATED
        # ---------------------------------------------

        if event_type == "PRODUCT_CREATED":

            print(
                f"Syncing new product: {product_id}"
            )

            sync_product(product_id)


        # ---------------------------------------------
        # PRODUCT UPDATED
        # ---------------------------------------------

        elif event_type == "PRODUCT_UPDATED":

            print(
                f"Updating product: {product_id}"
            )

            sync_product(product_id)


        # ---------------------------------------------
        # PRODUCT DELETED
        # ---------------------------------------------

        elif event_type == "PRODUCT_DELETED":

            print(
                f"Deleting product: {product_id}"
            )

            delete_product(product_id)


        else:

            print(
                "Unknown event type:",
                event_type
            )


    except Exception as e:

        print(
            "Error processing RabbitMQ event:",
            e
        )


# =====================================================
# Start RabbitMQ Listener
# =====================================================

def start_rabbitmq_listener():

    print(
        "Connecting to RabbitMQ..."
    )


    # ---------------------------------------------
    # Connection
    # ---------------------------------------------

    credentials = pika.PlainCredentials(
        "guest",
        "guest"
    )

    parameters = pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        port=RABBITMQ_PORT,
        credentials=credentials
    )


    connection = pika.BlockingConnection(
        parameters
    )

    channel = connection.channel()


    # ---------------------------------------------
    # Declare Queue
    # ---------------------------------------------

    channel.queue_declare(
        queue=QUEUE_NAME,
        durable=True
    )


    # ---------------------------------------------
    # Callback
    # ---------------------------------------------

    def callback(
        ch,
        method,
        properties,
        body
    ):

        print(
            "\nMessage received from RabbitMQ"
        )


        try:

            handle_product_event(
                body.decode("utf-8")
            )

            # Message processed successfully
            ch.basic_ack(
                delivery_tag=method.delivery_tag
            )

        except Exception as e:

            print(
                "Message processing failed:",
                e
            )

            # Don't acknowledge
            # RabbitMQ can redeliver it

            ch.basic_nack(
                delivery_tag=method.delivery_tag,
                requeue=False
            )


    # ---------------------------------------------
    # Start consuming
    # ---------------------------------------------

    channel.basic_qos(
        prefetch_count=1
    )

    channel.basic_consume(
        queue=QUEUE_NAME,
        on_message_callback=callback
    )


    print(
        f"RabbitMQ listener started."
    )

    print(
        f"Listening on queue: {QUEUE_NAME}"
    )


    channel.start_consuming()
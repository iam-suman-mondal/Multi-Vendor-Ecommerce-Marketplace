import HomeBanner from "../components/Banners";
import BannerSlider from "../components/Banners";
import BestSellers from "../components/Bestselling";
import Chatbot from "../components/Chatbot";
import TopTrending from "../components/Trending";

export default function PublicHome() {
  return (
    <>
      <HomeBanner/>
      <BestSellers/>
      {/* <TopTrending/> */}
          <Chatbot />
    </>
  );
}
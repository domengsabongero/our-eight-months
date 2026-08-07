import cover from "@/assets/story/1_CoverPhoto.png.asset.json";
import selfie1 from "@/assets/story/2_CuteSelfie.jpg.asset.json";
import selfie2 from "@/assets/story/3_CuteSelfie.jpg.asset.json";
import cafe from "@/assets/story/4_DatePhoto_FavCoffee_and_Cafe.jpg.asset.json";
import maki from "@/assets/story/5_DatePhoto_BestEver_Maki_EVER.jpg.asset.json";
import sachi from "@/assets/story/6_DatePhoto_First_Ever_Meet_With_My_DogSachi.jpg.asset.json";
import pole from "@/assets/story/7_FunnyAndCandid_MaxineOnPole.jpg.asset.json";
import goggles from "@/assets/story/8_FunnyAndCandid_BruceCloseUp_With_Goggles.jpg.asset.json";
import recentOuting from "@/assets/story/9_MostRecent_Outing.jpg.asset.json";
import firstOuting from "@/assets/story/10_FirstEverOuting.jpg.asset.json";

/** Real photos of Bruce & Maxine, served from CDN storage. */
export const STORY_PHOTOS = {
  cover: cover.url,
  selfie1: selfie1.url,
  selfie2: selfie2.url,
  cafe: cafe.url,
  maki: maki.url,
  sachi: sachi.url,
  pole: pole.url,
  goggles: goggles.url,
  recentOuting: recentOuting.url,
  firstOuting: firstOuting.url,
} as const;

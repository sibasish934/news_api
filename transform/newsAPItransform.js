import { generateUrl } from "../utils/helper.js";

class NewsAPITranform {
  static transform(news) {
    return {
      id: news.id,
      heading: news.title,
      news: news.content,
      image: generateUrl(news.image),
      created_at: news.created_at,
      reporter: {
        id: news?.user.id,
        name: news?.user.name,
        profile:
          news?.user?.profile != null
            ? generateUrl(news?.user?.profile)
            : "https://w7.pngwing.com/pngs/340/946/png-transparent-avatar-user-computer-icons-software-developer-avatar-child-face-heroes.png",
      },
    };
  }
}

export default NewsAPITranform;

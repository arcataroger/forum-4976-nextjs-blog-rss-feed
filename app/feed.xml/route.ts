import {performRequest} from "../../lib/datocms";
import {Feed} from "feed";


export async function GET() {
    const {allPosts, _site} = await performRequest({
        query: RSS_QUERY, // Your Dato query
        revalidate: 60 // in seconds
    })

    /* Example of allPosts
    [
      {
        "id": "19072916",
        "slug": "unforgettable-trip-to-the-great-wall-in-china",
        "title": "Unforgettable Trip to The Great Wall in China",
        "coverImage": {
          "responsiveImage": {
            "src": "https://www.datocms-assets.com/128930/1585207017-image-30-copyright.jpg?h=500&w=500"
          }
        },
        "date": "2020-03-06",
        "excerpt": "Our recommendations for your trip to the Great Wall in China."
      },
      etc.
    ]
     */

    const feed = new Feed({
        title: 'RSS Example with DatoCMS and Next.js',
        description: "Using DatoCMS and Next.js with the Feed lib to generate a RSS feed",
        id: "https://forum-4976-nextjs-blog-rss-feed.vercel.app/",
        link: "https://forum-4976-nextjs-blog-rss-feed.vercel.app/",
        language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
        image: allPosts[0]?.coverImage?.responsiveImage?.src ?? undefined,
        favicon: _site.favicon?.url ?? undefined,
        copyright: "All rights reserved",
    })

    allPosts.forEach(post => {
        feed.addItem({
            title: post.title,
            id: post.id,
            link: `/${post.slug}`,
            description: post.excerpt,
            author: [
                {
                    name: post.author.name,
                },
            ],
            date: new Date(post.date),
            image: post.coverImage?.responsiveImage?.src ?? undefined
        });
    });


    return new Response(
        feed.rss2(),
        { headers: { "Content-Type": "application/rss+xml" } }
    )
}


//language=graphql
const RSS_QUERY = `query BlogPostsForRSSQuery {
    allPosts(orderBy: date_DESC, first: 100) {
        id
        slug
        title
        coverImage {
            responsiveImage(imgixParams: {w: "500", h: "500"}) {
                src
            }
        }
        date
        excerpt
        author {
            name
        }
    }

    _site {
        favicon {
            url
        }
    }
}`
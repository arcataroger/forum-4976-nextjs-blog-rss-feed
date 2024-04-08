import {performRequest} from "../../lib/datocms";
import {Feed} from "feed";
import {Enclosure} from "feed/lib/typings";


export async function GET() {

    // Root of your website
    const baseUrl = 'https://forum-4976-nextjs-blog-rss-feed.vercel.app/'

    const {allPosts, _site} = await performRequest({
        query: RSS_QUERY, // Your Dato query
        revalidate: 60 // in seconds
    })

    const feed = new Feed({
        title: 'RSS Example with DatoCMS and Next.js',
        description: "Using DatoCMS and Next.js with the Feed lib to generate a RSS feed",
        id: baseUrl,
        link: baseUrl,
        language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
        image: allPosts[0].coverImage.responsiveImage.src ? encodeURI(allPosts[0].coverImage.responsiveImage.src) : undefined,
        favicon: _site.favicon?.url ?? undefined,
        copyright: "All rights reserved",
    })

    allPosts.forEach(post => {
        const postUrl = new URL(`/posts/${post.slug}`, baseUrl).toString();
        const imageUrl =  post.coverImage.responsiveImage.src ? new URL(post.coverImage.responsiveImage.src): undefined;
        const imageUrlEncoded = imageUrl && `${imageUrl.origin}${imageUrl.pathname}${encodeURIComponent(imageUrl.search)}`

        feed.addItem({
            title: post.title,
            id: postUrl,
            link: postUrl,
            description: post.excerpt,
            author: [
                {
                    name: post.author.name,
                },
            ],
            date: new Date(post.date),
            image: imageUrlEncoded,
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
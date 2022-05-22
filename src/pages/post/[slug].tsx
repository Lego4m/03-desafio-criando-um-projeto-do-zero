import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { PrismicRichText } from '@prismicio/react';
import * as prismicH from '@prismicio/helpers';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const router = useRouter();

  function getReadingTime(): number {
    const totalWords = post.data.content.reduce((acc, item) => {
      const bodyText = prismicH.asText(item.body as any);

      const headinglWords = item.heading?.split(/[^\w]/).length ?? 0; // const headingWords = item.heading.match(/\S+/g).length;
      const bodyWords = bodyText?.split(/[^\w]/).length ?? 0; // const bodyWords = bodyText.match(/\S+/g).length;

      return acc + headinglWords + bodyWords;
    }, 0);

    return Math.round(totalWords / 200);
  }

  if (router.isFallback) {
    return (
      <div className={styles.loading}>
        <img src="/Logo.svg" alt="logo" />

        <strong>Carregando...</strong>
      </div>
    );
  }

  return (
    <>
      <Header />
      <img className={styles.banner} src={post.data.banner.url} alt="" />

      <main className={styles.container}>
        <article className={styles.content}>
          <h1>{post.data.title}</h1>

          <div className={styles.infos}>
            <div>
              <FiCalendar size={20} />
              <time>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
            </div>

            <div>
              <FiUser size={20} />
              <span>{post.data.author}</span>
            </div>

            <div>
              <FiClock size={20} />
              <span>{`${getReadingTime()} min`}</span>
            </div>
          </div>

          <div className={styles.postContent}>
            {post.data.content.map(content => (
              <div key={`${content.heading}${content.body.length}`}>
                <h2>{content.heading}</h2>

                <PrismicRichText field={content.body as any} />
              </div>
            ))}
          </div>
        </article>
      </main>
    </>
  );
};

export default Post;

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const postsSlug = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths: postsSlug,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response,
    },
  };
};

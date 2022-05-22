import { useState } from 'react';

import { GetStaticProps } from 'next';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const Home: React.FC<HomeProps> = ({ postsPagination }) => {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleNextPage(): Promise<void> {
    const { results, next_page } = await fetch(nextPage)
      .then(res => res.json())
      .then(data => data);

    const newPosts = results.map(post => ({
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }));

    setPosts([...posts, ...newPosts]);
    setNextPage(next_page);
  }

  return (
    <>
      <Head>
        <title>spacetraveling.</title>
      </Head>

      <main className={commonStyles.container}>
        <div className={styles.content}>
          <img src="/Logo.svg" alt="logo" />

          <div className={styles.posts}>
            {posts.map(post => (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>

                  <div className={commonStyles.infos}>
                    <div>
                      <FiCalendar size={20} />
                      <time>
                        {format(
                          new Date(post.first_publication_date),
                          'dd MMM yyyy',
                          { locale: ptBR }
                        )}
                      </time>
                    </div>

                    <div>
                      <FiUser size={20} />
                      <span>{post.data.author}</span>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>

          {nextPage && (
            <button
              className={styles.nextPageButton}
              type="button"
              onClick={handleNextPage}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts');

  const { results, next_page } = postsResponse;

  const posts = results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  return {
    props: {
      postsPagination: {
        next_page,
        results: posts,
      },
    },
  };
};

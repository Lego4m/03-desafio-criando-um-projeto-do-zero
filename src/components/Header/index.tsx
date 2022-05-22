import Link from 'next/link';
import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

const Header: React.FC = () => {
  return (
    <header className={commonStyles.container}>
      <div className={styles.content}>
        <Link href="/">
          <a>
            <img src="/Logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  );
};

export default Header;

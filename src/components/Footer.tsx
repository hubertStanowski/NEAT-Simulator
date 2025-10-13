import { SiGithub } from 'react-icons/si';
import { githubURL } from '@/constants';

const Footer = () => {
  return (
    <footer className="c-space border-black-300 flex flex-wrap items-center justify-between border-t py-[clamp(0.5rem,1vh,1rem)]">
      <p className="text-white-500 text-[clamp(0.75rem,1.5vh,1rem)]">
        © 2025 Hubert Stanowski. All rights reserved.
      </p>

      <a href={githubURL} target="_blank" rel="noreferrer">
        <SiGithub className="highlight text-white-500 text-[clamp(1.5rem,3vh,2.5rem)]" />
      </a>
    </footer>
  );
};

export default Footer;

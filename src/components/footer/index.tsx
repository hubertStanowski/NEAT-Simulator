import { SiGithub } from "react-icons/si";
import { githubURL } from "../../constants";

const Footer = () => {
  return (
    <footer className="c-space flex flex-wrap items-center justify-between border-t border-black-300">
      <p className="text-white-500">
        © 2025 Hubert Stanowski. All rights reserved.
      </p>

      <a href={githubURL} target="_blank" rel="noreferrer">
        <SiGithub className="highlight mt-2 text-4xl text-white-500" />
      </a>
    </footer>
  );
};

export default Footer;

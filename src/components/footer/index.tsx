import { SiGithub, SiLinkedin } from "react-icons/si";
import { githubURL, linkedinURL } from "../../constants";

const Footer = () => {
  return (
    <footer className="c-space flex flex-wrap items-center justify-between border-t border-black-300 py-3">
      <p className="text-white-500">
        © 2025 Hubert Stanowski. All rights reserved.
      </p>
      <div className="flex flex-wrap justify-between gap-5">
        <a href={githubURL} target="_blank" rel="noreferrer">
          <SiGithub className="highlight text-4xl text-white-500" />
        </a>
        <a href={linkedinURL} target="_blank" rel="noreferrer">
          <SiLinkedin className="highlight text-4xl text-white-500" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;

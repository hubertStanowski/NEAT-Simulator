type NavItemsProps = {
  onClick?: () => void;
  selectedSimulation: string;
  setSelectedSimulation: (simulation: string) => void;
};

const NavItems: React.FC<NavItemsProps> = ({
  onClick = () => {},
  selectedSimulation,
  setSelectedSimulation,
}) => {
  return (
    <ul className="nav-ul ml-2 gap-4 sm:ml-5 sm:gap-14">
      <a
        className={`nav-li_a text-lg sm:text-2xl ${selectedSimulation === "Snake" ? "text-purple-700" : "text-neutral-400"}`}
        onClick={() => {
          setSelectedSimulation("Snake");
          onClick();
        }}
      >
        Snake
      </a>
      <a
        className={`nav-li_a text-lg sm:text-2xl ${selectedSimulation === "FlappyBird" ? "text-purple-700" : "text-neutral-400"}`}
        onClick={() => {
          alert(
            "I haven't yet transferred the FlappyBird simulation into a web interface. You can view my python implementation on my github and portfolio website",
          );
          // setSelectedSimulation("FlappyBird");
          onClick();
        }}
      >
        FlappyBird
      </a>
    </ul>
  );
};

export default NavItems;

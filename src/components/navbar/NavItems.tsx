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
    <ul className="nav-ul ml-1 gap-[clamp(1rem,3vw,3.5rem)] sm:ml-2">
      <a
        className={`nav-li_a text-[clamp(1rem,2.5vh,1.5rem)] ${selectedSimulation === "Snake" ? "text-purple-700" : "text-gray_gradient"}`}
        onClick={() => {
          setSelectedSimulation("Snake");
          onClick();
        }}
      >
        Snake
      </a>
      <a
        className={`nav-li_a text-[clamp(1rem,2.5vh,1.5rem)] ${selectedSimulation === "FlappyBird" ? "text-purple-700" : "text-gray_gradient"}`}
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

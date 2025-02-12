const NavItems = ({ onClick = () => {} }) => {
  return (
    <ul className="nav-ul ml-5">
      <a className="nav-li nav-li_a" onClick={onClick}>
        Snake
      </a>
      <a className="nav-li nav-li_a" onClick={onClick}>
        FlappyBird
      </a>
    </ul>
  );
};

export default NavItems;

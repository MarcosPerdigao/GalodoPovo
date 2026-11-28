import { render, screen } from "@testing-library/react";
import GamesSection from "./GamesSection";

test("leva o visitante ao jogo no próprio portal e informa sobre a sátira e o perfil local", () => {
  render(<GamesSection />);
  const playLink = screen.getByRole("link", { name: "Jogar agora" });
  expect(playLink).toHaveAttribute("href", "/jogos/demita-o-diretor/");
  expect(playLink).not.toHaveAttribute("target", "_blank");
  expect(screen.getByText(/jogo de ficção/i)).toHaveTextContent(/perfil fica no navegador/i);
});

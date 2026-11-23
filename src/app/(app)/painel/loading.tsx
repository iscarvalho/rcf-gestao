import { EsqueletoDestaque, EsqueletoPainel, FaixaPainel } from "./partes";

export default function CarregandoPainel() {
  return (
    <>
      <FaixaPainel>
        <EsqueletoDestaque />
      </FaixaPainel>
      <EsqueletoPainel />
    </>
  );
}

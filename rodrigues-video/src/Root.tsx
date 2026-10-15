import { Composition, Folder } from "remotion";
import { Dia39, EDICAO_DIA39 } from "./episodios/Dia39";
import { Dia40, EDICAO_DIA40 } from "./episodios/Dia40";
import { Dia41, EDICAO_DIA41 } from "./episodios/Dia41";

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="Rodrigues">
      <Composition
        id="Dia39"
        component={Dia39}
        durationInFrames={Math.ceil(EDICAO_DIA39.duracao * 60)}
        fps={60}
        width={1080}
        height={1920}
      />
      <Composition
        id="Dia40"
        component={Dia40}
        durationInFrames={Math.ceil(EDICAO_DIA40.duracao * 60)}
        fps={60}
        width={1080}
        height={1920}
      />
      <Composition
        id="Dia41"
        component={Dia41}
        durationInFrames={Math.ceil(EDICAO_DIA41.duracao * 60)}
        fps={60}
        width={1080}
        height={1920}
      />
    </Folder>
  );
};

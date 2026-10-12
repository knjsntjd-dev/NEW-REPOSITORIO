import { Composition, Folder } from "remotion";
import { Dia39, EDICAO_DIA39 } from "./episodios/Dia39";

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="Rodrigues">
      <Composition
        id="Dia39"
        component={Dia39}
        durationInFrames={Math.ceil(EDICAO_DIA39.duracao * 30)}
        fps={30}
        width={1080}
        height={1920}
      />
    </Folder>
  );
};

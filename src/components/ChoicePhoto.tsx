import { choiceImagery, choicePhotoFor } from "../imagery";
import type { Sex } from "../generated/contract";

/** Real photography selected and cropped by the frontend, never assessment data. */
export function ChoicePhoto({
  kind,
  sex,
}: {
  kind: keyof typeof choiceImagery;
  sex?: Sex | null;
}) {
  const photo = choicePhotoFor(kind, sex);
  return (
    <span className="choice-photo">
      <img
        src={photo.src}
        alt=""
        width="1100"
        height="800"
        decoding="async"
        style={{ objectPosition: photo.position }}
      />
    </span>
  );
}

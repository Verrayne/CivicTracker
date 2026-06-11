import type { IssuePhoto } from "../../types";

export function PhotoGallery({ photos }: { photos: IssuePhoto[] }) {
  if (!photos.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo, index) => (
        <a
          key={photo.id}
          href={photo.public_url}
          target="_blank"
          rel="noreferrer"
          className={index === 0 && photos.length > 2 ? "col-span-2 row-span-2" : ""}
        >
          <img
            src={photo.public_url}
            alt={`Issue photograph ${index + 1}`}
            className="h-full min-h-36 w-full rounded-xl object-cover transition hover:opacity-90"
          />
        </a>
      ))}
    </div>
  );
}

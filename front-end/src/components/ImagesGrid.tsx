import Image from "next/image";

interface ImagesGridProps {
  images: string[];
}

export default function ImagesGrid({ images }: ImagesGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 w-full mt-8 mb-4">
      {images.map((src, i) => (
        <Image
          key={i}
          src={src}
          alt={`puzzle-img-${i}`}
          width={120}
          height={120}
          className="rounded-xl shadow w-full aspect-square object-cover"
        />
      ))}
    </div>
  );
}

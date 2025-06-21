import Image from "next/image";

interface ProfileAvatarProps {
  alt?: string;
  src?: string;
}

export default function ProfileAvatar({
  src = "/profile.svg",
  alt = "Profile",
}: ProfileAvatarProps) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 240, height: 200 }} // Even bigger size
    >
      <div
        className="absolute top-1/2 left-1/2"
        style={{ transform: "translate(-50%, -50%)", zIndex: 0 }}
      >
        <div className="w-44 h-52 rounded-full flex items-center justify-center">
          {" "}
          {/* Even bigger size */}
          <Image
            src={src}
            alt={alt}
            width={180}
            height={180}
            className="rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

const maxAvatarFileSize = 5 * 1024 * 1024;
const avatarSize = 256;
const avatarMimeTypes = ["image/png", "image/jpeg", "image/webp"];

export const readAvatar = async (file: File): Promise<string> => {
  if (!avatarMimeTypes.includes(file.type))
    throw new Error("Escolha uma imagem PNG, JPG ou WebP.");
  if (file.size > maxAvatarFileSize)
    throw new Error("A imagem deve ter no máximo 5 MB.");
  const image = await createImageBitmap(file).catch(() => {
    throw new Error("Não foi possível abrir esta imagem.");
  });
  try {
    const canvas = document.createElement("canvas");
    canvas.width = avatarSize;
    canvas.height = avatarSize;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível preparar esta imagem.");
    const cropSize = Math.min(image.width, image.height);
    context.drawImage(
      image,
      (image.width - cropSize) / 2,
      (image.height - cropSize) / 2,
      cropSize,
      cropSize,
      0,
      0,
      avatarSize,
      avatarSize,
    );
    return canvas.toDataURL("image/png");
  } finally {
    image.close();
  }
};
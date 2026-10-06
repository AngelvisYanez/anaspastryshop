import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

export type InstagramPost = {
  id: string;
  imageUrl: string;
  caption: string | null;
  permalink: string;
};

type IgMedia = {
  id?: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
};

function imageFor(media: IgMedia): string | null {
  if (media.media_type === "VIDEO") return media.thumbnail_url ?? null;
  return media.media_url ?? media.thumbnail_url ?? null;
}

function isInstagramPermalink(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "www.instagram.com";
  } catch {
    return false;
  }
}

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("instagram-feed");

  try {
    const row = await prisma.platformApiConfig.findUnique({
      where: { provider: "instagram" },
    });
    const config = row?.config as { accessToken?: string } | null;
    const token = config?.accessToken?.trim();
    if (!token) return [];

    const url = new URL("https://graph.instagram.com/v21.0/me/media");
    url.searchParams.set(
      "fields",
      "id,caption,media_type,media_url,permalink,thumbnail_url",
    );
    url.searchParams.set("limit", "12");
    url.searchParams.set("access_token", token);

    const response = await fetch(url);
    if (!response.ok) return [];

    const body = (await response.json()) as { data?: IgMedia[] };
    if (!Array.isArray(body.data)) return [];

    return body.data.flatMap((media) => {
      const imageUrl = imageFor(media);
      if (!media.id || !imageUrl || !media.permalink) return [];
      if (!isInstagramPermalink(media.permalink)) return [];
      return [
        {
          id: media.id,
          imageUrl,
          caption: media.caption?.trim() || null,
          permalink: media.permalink,
        },
      ];
    });
  } catch {
    return [];
  }
}

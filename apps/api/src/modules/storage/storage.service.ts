import { randomUUID } from "node:crypto";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { STORAGE_FOLDERS, type StorageFolder } from "@wearly/shared/enums";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/heic": "heic",
  "image/heif": "heif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

@Injectable()
export class StorageService {
  private readonly client: SupabaseClient;
  private readonly bucket: string;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!(url && key)) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
      );
    }
    this.client = createClient(url, key, { auth: { persistSession: false } });
    this.bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "listing-photos";
  }

  isAllowedType(contentType: string): boolean {
    return ALLOWED_MIME.has(contentType.toLowerCase());
  }

  async createUploadUrl(
    userId: string,
    _filename: string,
    contentType: string,
    folder: StorageFolder = STORAGE_FOLDERS.LISTINGS
  ): Promise<{ path: string; uploadUrl: string; publicUrl: string }> {
    if (!this.isAllowedType(contentType)) {
      throw new InternalServerErrorException("Unsupported content type");
    }
    const ext = EXT_BY_MIME[contentType.toLowerCase()] ?? "bin";
    const path = `${folder}/${userId}/${randomUUID()}.${ext}`;

    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUploadUrl(path);
    if (error || !data) {
      throw new InternalServerErrorException(
        `Failed to create upload URL: ${error?.message ?? "unknown"}`
      );
    }

    const { data: publicData } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(path);

    return {
      path,
      publicUrl: publicData.publicUrl,
      uploadUrl: data.signedUrl,
    };
  }

  async remove(path: string): Promise<void> {
    await this.client.storage.from(this.bucket).remove([path]);
  }
}

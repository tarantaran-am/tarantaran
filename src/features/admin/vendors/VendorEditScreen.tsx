import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/features/admin/auth/dal";
import { AdminPageHeader } from "@/features/admin/AdminPageHeader";
import { VendorForm } from "./VendorForm";
import { PhotoManager } from "@/features/admin/photos/PhotoManager";
import { getVendorFormValues, getVendorOptions, getVendorPhotos } from "./queries";

export async function VendorEditScreen({ vendorId }: { vendorId: string }) {
  await requireAdmin();
  const [vendor, options, photos] = await Promise.all([
    getVendorFormValues(vendorId),
    getVendorOptions(),
    getVendorPhotos(vendorId),
  ]);
  if (!vendor) notFound();

  const { values } = vendor;
  const publicUrl = `/ru/catalog/${values.category}/${values.slug}`;

  return (
    <>
      <Link href="/admin/vendors" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Все подрядчики
      </Link>
      <AdminPageHeader
        title={values.nameRu}
        description={values.isPublished ? "Показывается на сайте." : "Скрыт: на сайте его не видно."}
        actions={
          values.isPublished && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-foreground underline underline-offset-4"
            >
              Открыть на сайте ↗
            </a>
          )
        }
      />
      <PhotoManager vendorId={vendorId} photos={photos} />
      <VendorForm vendorId={vendorId} initialValues={values} options={options} />
    </>
  );
}

export async function VendorCreateScreen() {
  await requireAdmin();
  const options = await getVendorOptions();

  return (
    <>
      <Link href="/admin/vendors" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Все подрядчики
      </Link>
      <AdminPageHeader
        title="Новый подрядчик"
        description="После создания можно будет добавить фото. Пока не отмечено «Показывать на сайте», подрядчик скрыт."
      />
      <VendorForm vendorId={null} options={options} />
    </>
  );
}

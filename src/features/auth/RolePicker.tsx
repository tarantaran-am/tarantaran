import { getTranslations } from "next-intl/server";
import type { AccountRole } from "@/generated/prisma/enums";
import { Button } from "@/shared/components/ui/button";
import { completeSignup } from "./actions";

const ROLES: AccountRole[] = ["couple", "vendor"];

// The last signup step, after Google: plain radios, so it works before hydration too.
export async function RolePicker({ locale }: { locale: string }) {
  const t = await getTranslations("Auth");

  return (
    <form action={completeSignup} className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-3 text-sm font-medium text-foreground">{t("signup.roleLegend")}</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ROLES.map((role) => (
            <label
              key={role}
              className="group relative flex cursor-pointer flex-col gap-4 rounded-[20px] border border-border bg-background p-5 transition-colors hover:border-foreground/30 has-checked:border-foreground has-checked:bg-muted/60 has-focus-visible:ring-3 has-focus-visible:ring-ring/30"
            >
              <input
                type="radio"
                name="role"
                value={role}
                defaultChecked={role === "couple"}
                required
                className="sr-only"
              />
              <span>
                <span className="block text-[15px] font-medium text-foreground">{t(`roles.${role}.title`)}</span>
                <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">
                  {t(`roles.${role}.description`)}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <input type="hidden" name="locale" value={locale} />
      <Button type="submit" size="lg" className="h-12 w-full">
        {t("signup.submit")}
      </Button>
    </form>
  );
}

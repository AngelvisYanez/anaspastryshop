import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listCoupons, listFormationsForCoupons } from "@/lib/actions/coupons";
import CouponManager from "./CouponManager";

export default async function CuponesPage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [coupons, formations] = await Promise.all([
    listCoupons(),
    listFormationsForCoupons(),
  ]);

  return (
    <div>
      <CouponManager
        initialCoupons={JSON.parse(JSON.stringify(coupons))}
        formations={formations}
      />
    </div>
  );
}

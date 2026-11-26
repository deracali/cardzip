import { getUsdToNgnRate, routeErrorResponse, salonServerRequest, RouteError } from "../../../../lib/paystack";
import type { SalonService } from "../../../../lib/salonApi";

export async function GET(request: Request) {
  try {
    const serviceId = new URL(request.url).searchParams.get("serviceId");
    if (!serviceId) throw new RouteError(400, "Choose a salon service.");
    const { services } = await salonServerRequest<{ services: SalonService[] }>("/services");
    const service = services.find((item) => item.id === serviceId && item.active);
    if (!service) throw new RouteError(404, "That salon service is no longer available.");
    const rate = getUsdToNgnRate();
    const amountMinor = Math.round(service.price * rate * 100);
    return Response.json({
      serviceId: service.id,
      priceUsd: service.price,
      amountMinor,
      amountNgn: amountMinor / 100,
      currency: "NGN",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return routeErrorResponse(error, "Paystack quote");
  }
}

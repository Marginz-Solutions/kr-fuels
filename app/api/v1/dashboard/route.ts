import { verifySession } from "@/lib/auth/verify-session";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await verifySession(req);

  if(!user) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  try {
    const categoriesList = ["Station Experience", "Safety & Education", "Pricing & Value", "Website/App Support", "New Station Request", "General Inquiry"];

    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Fetch collections in parallel
    const [
      stationsSnap,
      feedbacksSnap,
      kitsSnap
    ] = await Promise.all([
      (await adminDb.collection("stations").get()).docs,
      (await adminDb.collection("feedbacks").orderBy("createdAt", "desc").get()).docs,
      (await adminDb.collection("conversionKits").get()).docs
    ]);

    const totalFeedback = feedbacksSnap.length;
    const avgRating = Number(feedbacksSnap.reduce((acc, doc) => acc + doc.data().rating, 0) / totalFeedback).toFixed(2);

    const safetyAwarenessPercent = totalFeedback ? Number((feedbacksSnap.filter((doc) => doc.data().safetyAwareness === true).length / totalFeedback) * 100).toFixed(2) : 0;

    const resolutionRate = totalFeedback ? Number((feedbacksSnap.filter((doc) => doc.data().status === 'resolved').length / totalFeedback) * 100).toFixed(2) : 0;

    const byCategory = categoriesList.map((category) => ({
      name: category,
      count: feedbacksSnap.filter((doc) => doc.data().category === category).length
    }));

    const kitsByCategory = new Set();
    kitsSnap.forEach((doc) => {
      kitsByCategory.add(doc.data().kitType);
    });

    const recentFeedback = feedbacksSnap
        .filter((doc) => doc.data().category !== 'General Inquiry')
        .slice(0, 5)
        .map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                email: data.email ? data.email : undefined,
                phone: data.phoneNo,
                category: data.category,
                rating: data.rating ? data.rating : undefined,
                status: data.status,
                stationName: stationsSnap.find((station) => station.id?.toString() === data.stationId.id?.toString())?.data().stationName ?? undefined
            }
        });

    const recentEnquiries = feedbacksSnap
        .filter((doc) => doc.data().category === 'General Inquiry')
        .slice(0, 5)
        .map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                email: data.email ? data.email : undefined,
                category: data.category,
                message: data.message ? data.message : undefined,
                status: data.status
            }
        });

    const responseData = {
      stations: {
        total: stationsSnap.length,
        active: stationsSnap.filter((doc) => doc.data().status === 'active').length,
        inactive: stationsSnap.filter((doc) => doc.data().status === 'inactive').length
      },
      feedback: {
        total: totalFeedback,
        pending: feedbacksSnap.filter((doc) => doc.data().status === 'pending').length,
        inProgress: feedbacksSnap.filter((doc) => doc.data().status === 'in-progress').length,
        resolved: feedbacksSnap.filter((doc) => doc.data().status === 'resolved').length,
        avgRating,
        safetyAwarenessPercent,
        resolutionRate,
        byCategory,
        // lowRatedStations
      },
      enquiries: {
        new: feedbacksSnap.filter((doc) => doc.data().status === 'pending' && doc.data().createdAt <= last30Days).length,
        thisMonth: feedbacksSnap.filter((doc) => doc.data().status !== 'resolved' && doc.data().createdAt <= last30Days).length
      },
      products: {
        total: kitsSnap.length,
        categories: kitsByCategory.size,
      },
      recentFeedback,
      recentEnquiries
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });
  } 
  catch(error: any) {
    console.error("DASHBOARD ENDPOINT ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
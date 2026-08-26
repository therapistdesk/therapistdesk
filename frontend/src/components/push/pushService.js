function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat(
        (4 - (base64String.length % 4)) % 4
    );

    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);

    return Uint8Array.from(
        [...rawData].map((c) => c.charCodeAt(0))
    );
}

export async function subscribePush({
    selectedClient,
    apiUrl,
}) {
    if (!selectedClient) {
        return;
    }

    const reg = await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
        return;
    }

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    const convertedKey = urlBase64ToUint8Array(vapidKey);

    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
        try {
            sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedKey,
            });
        } catch (e) {
            console.error("SUBSCRIBE ERROR:", e);
            return;
        }
    }

    const subData = sub?.toJSON();

    if (!subData || !subData.keys) {
        console.error("INVALID SUB DATA", subData);
        return;
    }

    const res = await fetch(`${apiUrl}/push/subscribe`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            endpoint: subData.endpoint,
            p256dh: subData.keys.p256dh,
            auth: subData.keys.auth,
            clientId: selectedClient.id,
        }),
    });

    if (!res.ok) {
        console.error("PUSH SUBSCRIBE RESPONSE:", res.status);
    }
}
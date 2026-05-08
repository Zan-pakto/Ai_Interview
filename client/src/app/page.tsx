import { getAuthSession } from "@/lib/auth";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
  const session = await getAuthSession();
  const initialUser = session ? { id: session.userId, email: session.email, name: session.name } : null;

  return (
    <HomeClient initialUser={initialUser} />
  );
}

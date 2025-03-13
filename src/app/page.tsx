import Link from "next/link";

function CustomLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="text-blue-500 hover:text-blue-600 hover:underline text-xl">
      {children}
    </Link>
  );
}


export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col items-center gap-4 p-12">
        <h1 className="text-4xl font-bold">
          1ed tech platform, authentication playground
        </h1>

        <ul className="flex flex-col gap-2">
          <li>
            <CustomLink href="/scenario1">
              Scenario 1 - User Authentication (email/password)
            </CustomLink>
          </li>
          <li>
            <CustomLink href="/scenario2">
              Scenario 2 - Application Authentication of Users
            </CustomLink>
          </li>
          <li>
            <CustomLink href="/scenario3">
              Scenario 3 - Machine-to-Machine Authentication (backend services,
              third parties)
            </CustomLink>
          </li>
        </ul>
      </div>
    </div>
  );
}

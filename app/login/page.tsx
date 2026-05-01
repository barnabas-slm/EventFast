import { LoginForm } from "./login-form";

export default function LoginPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
			<section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
				<h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Log in</h1>
				<p className="mt-2 text-sm text-zinc-600">
					Enter your email and we will send you a magic login link.
				</p>

				<div className="mt-6">
					<LoginForm />
				</div>
			</section>
		</main>
	);
}

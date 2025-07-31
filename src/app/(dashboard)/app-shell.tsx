"use client";

import { AppSidebar } from "@/components/navigation/app-sidebar";
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbSeparator,
	BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { HeaderSearch } from "@/components/search/header-search";

export default function AppShell({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { items } = useBreadcrumb();

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								{items.map((item, index) => (
									<BreadcrumbItem key={item.href}>
										{index < items.length - 1 ? (
											<>
												<BreadcrumbLink href={item.href}>
													{item.label}
												</BreadcrumbLink>
												<BreadcrumbSeparator />
											</>
										) : (
											<BreadcrumbPage>{item.label}</BreadcrumbPage>
										)}
									</BreadcrumbItem>
								))}
							</BreadcrumbList>
						</Breadcrumb>
					</div>
					<div className="flex-1 px-4">
						<HeaderSearch />
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}

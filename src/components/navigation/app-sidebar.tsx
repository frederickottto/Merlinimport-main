"use client";

import * as React from "react";
import Image from "next/image";

import { NavMain } from "@/components/navigation/nav-main";
import { NavSecondary } from "@/components/navigation/nav-secondary";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { getMainNavConfig, getProjectsConfig, getTrainingsConfig, getSettingsConfig, getTasksConfig } from "@/server/controllers/navigation/nav-config";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<Label className="flex items-center gap-2">
					<div className=" flex aspect-square size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
						<Image
							src="/merlin-logo-dark.png"
							alt="Merlin Logo"
							width={46}
							height={46}
							className="object-contain rounded-xl"
						/>
					</div>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-semibold">MERLIN</span>
						<span className="truncate text-xs italic">beta v.4.0.1</span>
					</div>
				</Label>
			</SidebarHeader>
			<SidebarContent>
				<NavSecondary projects={getTasksConfig()} label="Tasks" />

				<NavMain items={getMainNavConfig()} />
				
				<NavSecondary projects={getProjectsConfig()} label="AI-Wizard" />
				<NavSecondary projects={getTrainingsConfig()} label="Vorlagen" />
			</SidebarContent>
			
			<SidebarFooter>
				<NavSecondary projects={getSettingsConfig()} label="Settings" />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
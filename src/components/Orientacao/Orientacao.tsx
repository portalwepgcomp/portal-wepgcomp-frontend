"use client";

import Link from "next/link";

import { useEffect, useState } from "react";
import HtmlEditorComponent from "../HtmlEditorComponent/HtmlEditorComponent";

import { useOrientacao } from "@/hooks/useOrientacao";

import { getEventEditionIdStorage } from "@/context/AuthProvider/util";
import { cn } from "@/utils/cn";

export default function Orientacao() {
	const { postOrientacao, putOrientacao, getOrientacoes, orientacoes } =
		useOrientacao();

	const [content, setContent] = useState(orientacoes?.summary || "");

	const handleEditOrientacao = () => {
		const idOrientacao = orientacoes?.id;
		const eventEditionId = getEventEditionIdStorage();

		if (idOrientacao) {
			putOrientacao(idOrientacao, {
				eventEditionId: eventEditionId ?? "",
				summary: content,
			});
		} else {
			postOrientacao({
				eventEditionId: eventEditionId ?? "",
				summary: content,
			});
		}
	};

	useEffect(() => {
		getOrientacoes();
	}, []);

	useEffect(() => {
		setContent(orientacoes?.summary || "");
	}, [orientacoes?.summary]);

	return (
		<div
			id="Orientacao"
			className={cn(
				"relative flex w-full min-h-[600px] flex-col items-center justify-center",
				"bg-[#ea8b2b] p-8 text-white",
				"max-[480px]:w-inherit max-[480px]:ml-0 max-[480px]:px-8 max-[480px]:py-4",
			)}
		>
			<div className="orientacao-titulo mb-4 text-center text-4xl font-bold text-white max-[480px]:mb-4">
				Orientações
			</div>

			<HtmlEditorComponent
				content={content}
				onChange={(newValue) => setContent(newValue)}
				handleEditField={handleEditOrientacao}
			/>

			<Link
				className={cn(
					"orientacao-link mt-10 flex h-[60px] w-[300px] cursor-pointer items-center justify-center",
					"rounded-xl border border-white text-lg font-semibold text-white",
					"hover:bg-white hover:text-brand-orange hover:opacity-80",
					"max-[480px]:mt-5",
				)}
				href="/orientacoes"
			>
				Ver todas as orientações
			</Link>
		</div>
	);
}

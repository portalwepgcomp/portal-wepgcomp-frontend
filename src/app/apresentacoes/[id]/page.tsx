"use client";

import Banner from "@/components/UI/Banner";
import Button from "@/components/UI/Button";
import Spinner from "@/components/UI/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { useSweetAlert } from "@/hooks/useAlert";
import { usePresentation } from "@/hooks/usePresentation";
import { cn } from "@/utils/cn";
import { registrarErro } from "@/utils/logError";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { CalendarPlus, Download, StarIcon } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatDate, formatOnlyTime, getInitials } from "./utils";
import { Presentation, PresentationBookmark } from "@/models/presentation";

const botaoAcaoBase =
  "flex items-center gap-2 rounded-lg px-6 py-3 text-base font-semibold transition duration-base";

export default function ApresentacaoDetalhes() {
    const params = useParams();
    const router = useRouter();
    const presentationId = params.id as string;

    const { signed } = useAuth();
    const {
        getPresentationById,
        postPresentationBookmark,
        getPresentationBookmark,
        deletePresentationBookmark
    } = usePresentation();

    const { showAlert } = useSweetAlert();
    const [presentation, setPresentation] = useState<Presentation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [presentationBookmark, setPresentationBookmark] = useState<PresentationBookmark>();

    const isFetching = useRef(false);
    const hasFetched = useRef(false);

    useEffect(() => {
        dayjs.locale("pt-br");
    }, []);

    useEffect(() => {
        if (!presentationId || isFetching.current || hasFetched.current) {
            return;
        }

        const controller = new AbortController();

        async function fetchPresentation() {
            isFetching.current = true;

            try {
                const data = await getPresentationById(presentationId);
                if (!controller.signal.aborted) {
                    setPresentation(data);
                    setLoading(false);
                    setError(false);
                    hasFetched.current = true;
                }

                if (signed) {
                    try {
                        const bookmark = await getPresentationBookmark({ presentationId });
                        if (!controller.signal.aborted) {
                            setPresentationBookmark(bookmark);
                        }
                    } catch (_errBookmark) {
                        // Ignora erro de bookmark se falhar
                    }
                }

            } catch (_err) {
                if (!controller.signal.aborted) {
                    showAlert({
                        icon: "error",
                        title: "Erro ao carregar apresentação",
                        text: "Ocorreu um erro ao carregar os detalhes da apresentação. Tente novamente mais tarde!",
                        confirmButtonText: "Retornar",
                    });
                    setError(true);
                    setLoading(false);
                }
            } finally {
                if (!controller.signal.aborted) {
                    isFetching.current = false;
                }
            }
        }

        fetchPresentation();

        return () => {
            controller.abort();
            isFetching.current = false;
        };
    }, [presentationId, signed, getPresentationBookmark, getPresentationById, showAlert]);

    const handleBack = () => {
        router.back();
    };

    const handleFavorite = async () => {
        if (!signed) {
            const res = await showAlert({
                icon: "info",
                title: "Acesso restrito",
                text: "Você precisa estar conectado à sua conta para favoritar esta apresentação.",
                showCancelButton: true,
                confirmButtonText: "Fazer Login",
                cancelButtonText: "Cancelar",
            });

            if (res.isConfirmed) {
                router.push(`/login?redirect=/apresentacoes/${presentationId}`);
            }
            return;
        }

        const wasBookmarked = presentationBookmark?.bookmarked ?? false;

        setPresentationBookmark({
            bookmarked: !wasBookmarked
        });

        try {
            if (wasBookmarked) {
                await deletePresentationBookmark({ presentationId });
            } else {
                await postPresentationBookmark({ presentationId });
            }
        } catch (_err) {
            setPresentationBookmark({
                bookmarked: wasBookmarked
            });

            showAlert({
                icon: "error",
                title: "Erro ao favoritar",
                text: "Não foi possível atualizar o favorito. Tente novamente.",
            });
        }
    };

    const handleAvaliar = async () => {
        if (!signed) {
            const res = await showAlert({
                icon: "info",
                title: "Acesso restrito",
                text: "Você precisa estar conectado à sua conta para avaliar esta apresentação.",
                showCancelButton: true,
                confirmButtonText: "Fazer Login",
                cancelButtonText: "Cancelar",
            });

            if (res.isConfirmed) {
                router.push(`/login?redirect=/avaliacao/${presentationId}`);
            }
            return;
        }

        router.push('/avaliacao/' + presentation?.id);
    };

    const handleAddToCalendar = () => {
        if (!presentation?.presentationTime) {
            showAlert({
                icon: "error",
                title: "Erro",
                text: "Data da apresentação não disponível.",
            });
            return;
        }

        try {
            const startDate = dayjs(presentation.presentationTime);
            const endDate = dayjs(presentation.presentationTime).add(1, 'hour');

            const startTime = startDate.format('YYYYMMDDTHHmmss');
            const endTime = endDate.format('YYYYMMDDTHHmmss');

            const eventDetails = {
                text: presentation.submission?.title || 'Apresentação',
                dates: `${startTime}/${endTime}`,
                details: presentation.submission?.abstract || '',
                location: 'Auditório A do IGEO',
                ctz: 'America/Sao_Paulo',
            };

            const params = new URLSearchParams();
            params.append('action', 'TEMPLATE');
            params.append('text', eventDetails.text);
            params.append('dates', eventDetails.dates);
            params.append('details', eventDetails.details);
            params.append('location', eventDetails.location);
            params.append('ctz', eventDetails.ctz);

            const calendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;

            window.open(calendarUrl, '_blank', 'noopener,noreferrer');

        } catch (err) {
            showAlert({
                icon: "error",
                title: "Erro ao criar evento",
                text: "Não foi possível criar o evento no calendário. Tente novamente.",
            });
            registrarErro("Erro ao criar evento no calendário", err);
        }
    };

    const handleDownloadPdf = async () => {
        const pdfFile = presentation?.submission?.pdfFile;

        if (!pdfFile) {
            showAlert({
                icon: "warning",
                title: "Arquivo não disponível",
                text: "Esta apresentação não possui arquivo PDF cadastrado.",
            });
            return;
        }

        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/uploads/${pdfFile}`;

            const response = await fetch(url, { method: 'HEAD' });

            if (!response.ok) {
                showAlert({
                    icon: "warning",
                    title: "Arquivo não encontrado",
                    text: "O arquivo PDF desta apresentação não está mais disponível no servidor.",
                });
                return;
            }

            window.open(url, '_blank', 'noopener,noreferrer');

        } catch (err) {
            registrarErro("Erro ao verificar arquivo", err);
            showAlert({
                icon: "error",
                title: "Erro ao baixar",
                text: "Não foi possível verificar a disponibilidade do arquivo. Tente novamente mais tarde.",
            });
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-6">
                <Spinner />
                <p className="text-foreground">Carregando detalhes da apresentação...</p>
            </div>
        );
    }

    if (error || !presentation) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-6">
                <h2 className="text-foreground">Apresentação não encontrada</h2>
                <p className="text-muted">Não foi possível carregar os detalhes desta apresentação.</p>
                <Button onClick={handleBack}>
                    Voltar para a programação
                </Button>
            </div>
        );
    }

    return (
        <>
            <Banner title="Detalhes da Apresentação" />
            <div className="mx-auto max-w-[900px] px-5 py-10">
                <button
                    type="button"
                    className="mb-6 cursor-pointer border-none bg-transparent p-0 text-base font-semibold text-brand-blue transition hover:text-brand-navy"
                    onClick={() => router.back()}
                >
                    ← Voltar para programação
                </button>

                <div className="mb-8 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-light p-8">
                    <h1 className="m-0 text-[28px] font-bold leading-snug text-white max-md:text-[22px]">
                        {presentation.submission?.title}
                    </h1>
                </div>

                <div className="rounded-xl border border-line bg-card p-6">
                    <h3 className="mb-5 text-xl font-bold text-brand-navy">Ações</h3>
                    <div className="flex flex-wrap gap-3 max-md:flex-col">
                        <button
                            type="button"
                            className={cn(
                                botaoAcaoBase,
                                "border-2 border-brand-blue bg-card text-brand-blue hover:bg-brand-blue hover:text-white max-md:w-full max-md:justify-center",
                            )}
                            onClick={handleAvaliar}
                        >
                            <StarIcon className="h-5 w-5" />
                            Avaliar
                        </button>

                        <button
                            type="button"
                            className={cn(
                                botaoAcaoBase,
                                "border-2 border-brand-blue bg-card text-brand-blue hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50 max-md:w-full max-md:justify-center",
                            )}
                            onClick={handleDownloadPdf}
                            disabled={!presentation.submission?.pdfFile}
                        >
                            <Download className="h-5 w-5" />
                            Baixar
                        </button>

                        <button
                            type="button"
                            className={cn(
                                botaoAcaoBase,
                                "border-2 border-brand-blue bg-card text-brand-blue hover:bg-primary-light max-md:w-full max-md:justify-center",
                            )}
                            onClick={handleFavorite}
                        >
                            <span
                                className="text-lg"
                                style={{ color: presentationBookmark?.bookmarked ? 'red' : 'inherit' }}
                            >
                                {presentationBookmark?.bookmarked ? '❤️' : '🤍'}
                            </span>
                            {presentationBookmark?.bookmarked ? 'Desfavoritar' : 'Favoritar'}
                        </button>

                        <button
                            type="button"
                            className={cn(
                                botaoAcaoBase,
                                "border-none bg-brand-blue text-white hover:bg-brand-navy max-md:w-full max-md:justify-center",
                            )}
                            onClick={handleAddToCalendar}
                        >
                            <CalendarPlus className="h-5 w-5" />
                            Agendar
                        </button>

                        {presentation.submission?.linkHostedFile && (
                            <a
                                href={presentation.submission?.linkHostedFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    botaoAcaoBase,
                                    "border-2 border-brand-blue bg-card text-brand-blue no-underline hover:bg-primary-light max-md:w-full max-md:justify-center",
                                )}
                            >
                                <span className="text-lg">🔗</span>
                                Acessar
                            </a>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-8">
                    <div className="flex items-center gap-5 rounded-xl border border-line bg-card p-6 max-md:flex-col max-md:text-center">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-blue">
                            {presentation.submission?.mainAuthor?.photoFilePath ? (
                                <Image
                                    src={presentation.submission.mainAuthor.photoFilePath}
                                    alt={presentation.submission.mainAuthor.name || "Foto do autor"}
                                    width={80}
                                    height={80}
                                    className="h-full w-full object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="text-[28px] font-bold text-white">
                                    {getInitials(presentation.submission?.mainAuthor?.name || '')}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="mb-2 text-[22px] font-bold text-[#1a1a1a]">
                                {presentation.submission?.mainAuthor?.name}
                            </h2>
                            <p className="my-1 flex items-center gap-1.5 text-sm text-muted max-md:justify-center">
                                <span>✉</span> {presentation.submission?.mainAuthor?.email}
                            </p>
                            {presentation.submission?.advisor && (
                                <p className="my-1 text-sm text-muted">
                                    Orientador: {presentation.submission.advisor.name}
                                </p>
                            )}
                            {presentation.submission?.mainAuthor?.lattesUrl && (
                                <a
                                    href={presentation.submission.mainAuthor.lattesUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-brand-blue px-3 py-1.5 text-sm font-semibold text-brand-blue no-underline transition hover:bg-brand-blue hover:text-white"
                                >
                                    <span>🔗</span> Currículo Lattes
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-line bg-card p-6">
                        <h3 className="mb-5 text-xl font-bold text-brand-navy">Detalhes da Apresentação</h3>
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 max-md:grid-cols-1">
                            <div className="flex gap-3">
                                <span className="shrink-0 text-2xl">📅</span>
                                <div className="flex-1">
                                    <strong className="mb-1 block text-xs uppercase tracking-wide text-muted">Data</strong>
                                    <p className="m-0 text-base text-[#1a1a1a]">{formatDate(presentation.presentationTime || "")}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="shrink-0 text-2xl">🕐</span>
                                <div className="flex-1">
                                    <strong className="mb-1 block text-xs uppercase tracking-wide text-muted">Horário</strong>
                                    <p className="m-0 text-base text-[#1a1a1a]">{formatOnlyTime(presentation.presentationTime || "")}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="shrink-0 text-2xl">📍</span>
                                <div className="flex-1">
                                    <strong className="mb-1 block text-xs uppercase tracking-wide text-muted">Local</strong>
                                    <p className="m-0 text-base text-[#1a1a1a]">Auditório A do IGEO</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-line bg-card p-6">
                        <h3 className="mb-5 text-xl font-bold text-brand-navy">Resumo</h3>
                        <p className="m-0 text-base leading-relaxed text-[#4a4a4a]">
                            {presentation.submission?.abstract}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

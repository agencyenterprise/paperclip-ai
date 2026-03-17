import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { companiesApi } from "../api/companies";
import { issuesApi } from "../api/issues";
import { agentsApi } from "../api/agents";
import { queryKeys } from "../lib/queryKeys";
import { relativeTime } from "../lib/utils";
import {
  parseMetaEngineMeta,
  companySlug,
  alignmentScoreColor,
  alignmentScoreLabel,
} from "../lib/meta-engine";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Zap,
  Rocket,
  ArrowUpRight,
  Loader2,
  Building2,
  Target,
  TrendingUp,
  Cpu,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

const BHAG = {
  headline: "Make aligned AI economically dominant.",
  body: "The Meta-Engine converts alignment research into autonomous businesses — deployed across the economy — until building AI the right way is the only strategy that wins.",
  pillars: [
    { icon: Cpu, label: "Aligned systems", sub: "reduce cost under scale" },
    { icon: TrendingUp, label: "Long-horizon compounding", sub: "outperforms short-term gains" },
    { icon: Target, label: "Avoid fragility", sub: "coordination failures stop misaligned systems" },
  ],
};

export function MetaEngine() {
  const { companies } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const queryClient = useQueryClient();

  const [launchOpen, setLaunchOpen] = useState(false);
  const [context, setContext] = useState("");

  useEffect(() => {
    setBreadcrumbs([{ label: "Meta Engine" }]);
  }, [setBreadcrumbs]);

  // Find Meta Engine company
  const metaEngineCompany = companies.find(
    (c) => c.name.toLowerCase().includes("meta engine") || c.issuePrefix === "MET",
  );

  // Portfolio: companies with meta-engine front-matter
  const portfolioCompanies = companies
    .filter((c) => {
      const meta = parseMetaEngineMeta(c.description);
      return meta.isMetaEngine;
    })
    .map((c) => ({ company: c, meta: parseMetaEngineMeta(c.description) }));

  // Meta Engine agents — find Strategist for auto-assign
  const { data: metaAgents } = useQuery({
    queryKey: queryKeys.agents.list(metaEngineCompany?.id ?? ""),
    queryFn: () => agentsApi.list(metaEngineCompany!.id),
    enabled: !!metaEngineCompany,
  });

  const strategist = metaAgents?.find(
    (a) => a.name.toLowerCase().includes("strategist"),
  );

  // Meta Engine activity (recent issues)
  const { data: metaIssues } = useQuery({
    queryKey: metaEngineCompany
      ? queryKeys.issues.list(metaEngineCompany.id)
      : ["no-meta-engine"],
    queryFn: () => issuesApi.list(metaEngineCompany!.id),
    enabled: !!metaEngineCompany,
  });

  const activeBuilds = (metaIssues ?? []).filter(
    (i) => i.status === "in_progress" || i.status === "todo",
  );

  // Launch mutation — create "Do it" issue assigned to Strategist
  const launchMutation = useMutation({
    mutationFn: () => {
      if (!metaEngineCompany) throw new Error("Meta Engine company not found");
      const title = context.trim()
        ? `Create a new business — ${context.trim().slice(0, 80)}`
        : "Create a new business";
      return issuesApi.create(metaEngineCompany.id, {
        title,
        description: context.trim() || null,
        status: "todo",
        priority: "high",
        assigneeAgentId: strategist?.id ?? null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: metaEngineCompany
          ? queryKeys.issues.list(metaEngineCompany.id)
          : ["no-meta-engine"],
      });
      setLaunchOpen(false);
      setContext("");
    },
  });

  const { data: stats } = useQuery({
    queryKey: queryKeys.companies.stats,
    queryFn: () => companiesApi.stats(),
  });

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">

      {/* ── BHAG Header ───────────────────────────────────────────────── */}
      <div className="pt-2">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{BHAG.headline}</h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {BHAG.body}
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {BHAG.pillars.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="border border-border rounded-lg p-4 bg-card flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Companies deployed",
            value: portfolioCompanies.length,
            sub: "autonomous businesses",
          },
          {
            label: "Active builds",
            value: activeBuilds.length,
            sub: activeBuilds.length > 0 ? "in progress now" : "idle",
          },
          {
            label: "Automation target",
            value: "70–95%",
            sub: "of full business lifecycle",
          },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="border border-border rounded-lg p-4 bg-card"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Active builds ─────────────────────────────────────────────── */}
      {activeBuilds.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Live builds
          </h2>
          <div className="space-y-2">
            {activeBuilds.map((issue) => (
              <div
                key={issue.id}
                className="border border-border rounded-lg px-4 py-3 bg-card flex items-center gap-3"
              >
                <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{issue.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {issue.issueNumber} · {relativeTime(issue.createdAt)}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    issue.status === "in_progress"
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {issue.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Portfolio ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Portfolio
          </h2>
          <Button
            size="sm"
            onClick={() => setLaunchOpen(true)}
            disabled={!metaEngineCompany}
          >
            <Rocket className="h-3.5 w-3.5 mr-1.5" />
            Deploy New Company
          </Button>
        </div>

        {portfolioCompanies.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg p-10 text-center">
            <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No portfolio companies yet</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Deploy the first one — the Meta-Engine will find the market and build the product.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setLaunchOpen(true)}
              disabled={!metaEngineCompany}
            >
              <Rocket className="h-3.5 w-3.5 mr-1.5" />
              Deploy Now
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {portfolioCompanies.map(({ company, meta }) => {
              const slug = companySlug(company.name);
              const companyStats = stats?.[company.id];

              return (
                <div
                  key={company.id}
                  className="border border-border rounded-lg p-5 bg-card flex flex-col gap-4 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {company.brandColor && (
                          <div
                            className="w-3.5 h-3.5 rounded-sm shrink-0"
                            style={{ backgroundColor: company.brandColor }}
                          />
                        )}
                        <h3 className="font-semibold text-base truncate">{company.name}</h3>
                      </div>
                      {meta.tagline && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {meta.tagline}
                        </p>
                      )}
                    </div>
                    <Link
                      to={`/showcase/${slug}`}
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      title="View landing page"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>

                  {/* Market + alignment */}
                  <div className="flex flex-wrap gap-2">
                    {meta.market && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-medium">
                        {meta.market}
                      </span>
                    )}
                    {meta.alignmentScore !== null && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted ${alignmentScoreColor(meta.alignmentScore)}`}
                      >
                        ⬡ Alignment: {meta.alignmentScore}/50 · {alignmentScoreLabel(meta.alignmentScore)}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        company.status === "active"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {company.status}
                    </span>
                  </div>

                  {/* Alignment connection */}
                  {meta.alignmentConnection && (
                    <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2.5 italic">
                      {meta.alignmentConnection}
                    </p>
                  )}

                  {/* Footer: stats + CTA */}
                  <div className="flex items-center justify-between mt-auto pt-1 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {companyStats?.agentCount ?? 0} agents ·{" "}
                      {companyStats?.issueCount ?? 0} issues ·{" "}
                      {relativeTime(company.createdAt)}
                    </span>
                    <Link
                      to={`/showcase/${slug}`}
                      className="text-xs font-medium text-primary flex items-center gap-0.5 hover:underline"
                    >
                      View showcase <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Recent Meta Engine activity ───────────────────────────────── */}
      {metaIssues && metaIssues.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Recent activity
          </h2>
          <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
            {metaIssues.slice(0, 8).map((issue) => (
              <div key={issue.id} className="flex items-center gap-3 px-4 py-3 bg-card">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    issue.status === "done"
                      ? "bg-green-500"
                      : issue.status === "in_progress"
                        ? "bg-blue-500"
                        : issue.status === "cancelled"
                          ? "bg-muted-foreground"
                          : "bg-yellow-500"
                  }`}
                />
                <span className="text-xs text-muted-foreground w-16 shrink-0">
                  {issue.issueNumber}
                </span>
                <span className="text-sm flex-1 truncate">{issue.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {relativeTime(issue.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Launch dialog ─────────────────────────────────────────────── */}
      <Dialog open={launchOpen} onOpenChange={setLaunchOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Deploy New Company
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              The Meta-Engine will autonomously find a market, build the product, and deploy
              it as a live Paperclip company. This takes 5–15 minutes.
            </p>
            {/* Assignee indicator */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium ${
              strategist
                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
            }`}>
              {strategist ? (
                <>✓ Will be assigned to <strong>{strategist.name}</strong> automatically</>
              ) : (
                <>⚠ Strategist agent not found — issue will be created unassigned</>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Context{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Textarea
                placeholder="e.g. focus on healthcare compliance, or try a SaaS sector, or anything you want the Researcher to consider..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={4}
                className="text-sm resize-none"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setLaunchOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => launchMutation.mutate()}
                disabled={launchMutation.isPending}
              >
                {launchMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Launching…
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 mr-1.5" />
                    Launch
                  </>
                )}
              </Button>
            </div>
            {launchMutation.error && (
              <p className="text-xs text-destructive">
                {launchMutation.error instanceof Error
                  ? launchMutation.error.message
                  : "Launch failed"}
              </p>
            )}
            {!metaEngineCompany && (
              <p className="text-xs text-destructive">
                Meta Engine company not found. Make sure a company named "Meta Engine" (prefix MET) exists.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

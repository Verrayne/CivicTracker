import { useQuery } from "@tanstack/react-query";
import { getIssue, getIssues, getIssueTypes, getWards, type IssueFilters } from "../services/issues";

export function useReferenceData() {
  const wards = useQuery({ queryKey: ["wards"], queryFn: getWards });
  const issueTypes = useQuery({ queryKey: ["issue-types"], queryFn: getIssueTypes });
  return { wards, issueTypes };
}

export function useIssues(filters: IssueFilters) {
  return useQuery({
    queryKey: ["issues", filters],
    queryFn: () => getIssues(filters),
  });
}

export function useIssue(issueNumber: string) {
  return useQuery({
    queryKey: ["issue", issueNumber],
    queryFn: () => getIssue(issueNumber),
    enabled: Boolean(issueNumber),
  });
}

import {
  createContext,
  ReactNode,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { committerMembersApi } from "@/services/CommitteeMember";
import { Committer } from "@/models/committer";

interface CommitterProps {
  children: ReactNode;
}

interface CommitterProviderData {
  committerList: Committer[];
  getCommitterAll: (eventEditionId?: string) => Promise<Committer[]>;
}

export const CommitteerContext = createContext<CommitterProviderData>(
  {} as CommitterProviderData
);

export const useCommittee = () => useContext(CommitteerContext);

export const CommitterProvider = ({ children }: CommitterProps) => {
  const [committerList, setcommitterList] = useState<Committer[]>([]);

  const getCommitterAll = useCallback(async (eventEditionId?: string): Promise<Committer[]> => {
    if (!eventEditionId) {
      setcommitterList([]);
      return [];
    }
    try {
      const response = await committerMembersApi.getAllMembers(eventEditionId);
      setcommitterList(response || []);
      return response || [];
    } catch {
      setcommitterList([]);
      return [];
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      committerList,
      getCommitterAll,
    }),
    [committerList, getCommitterAll]
  );

  return (
    <CommitteerContext.Provider value={contextValue}>
      {children}
    </CommitteerContext.Provider>
  );
};
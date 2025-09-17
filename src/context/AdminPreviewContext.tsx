import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/router';

export type InlineEditTarget = {
  type: 'property' | 'article' | 'page';
  id?: number | string;
  slug?: string;
  path?: string;
  label?: string;
};

interface AdminPreviewContextValue {
  isPreview: boolean;
  lastInlineEditTarget: InlineEditTarget | null;
  activatePreview: () => void;
  exitPreview: () => void;
  requestInlineEdit: (target: InlineEditTarget) => void;
}

const AdminPreviewContext = createContext<AdminPreviewContextValue>({
  isPreview: false,
  lastInlineEditTarget: null,
  activatePreview: () => {},
  exitPreview: () => {},
  requestInlineEdit: () => {},
});

function hasPreviewCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .some((cookie) => cookie.startsWith('admin_preview=1'));
}

function setPreviewCookie(enabled: boolean): void {
  if (typeof document === 'undefined') return;
  if (enabled) {
    document.cookie = 'admin_preview=1; Path=/; SameSite=Lax';
  } else {
    document.cookie = 'admin_preview=; Path=/; Max-Age=0; SameSite=Lax';
  }
}

export function AdminPreviewProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);
  const [lastInlineEditTarget, setLastInlineEditTarget] = useState<InlineEditTarget | null>(
    null,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const queryFlag =
      params.get('adminPreview') === '1' || params.get('preview') === 'admin';
    if (queryFlag) {
      setPreviewCookie(true);
      setIsPreview(true);
      return;
    }
    setIsPreview(hasPreviewCookie());
  }, [router.asPath]);

  const activatePreview = useCallback(() => {
    setPreviewCookie(true);
    setIsPreview(true);
  }, []);

  const exitPreview = useCallback(() => {
    setPreviewCookie(false);
    setIsPreview(false);
  }, []);

  const requestInlineEdit = useCallback((target: InlineEditTarget) => {
    setLastInlineEditTarget(target);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('admin-inline-edit', {
          detail: target,
        }),
      );
    }
  }, []);

  useEffect(() => {
    if (!lastInlineEditTarget) return;
    const timeout = setTimeout(() => {
      setLastInlineEditTarget(null);
    }, 5000);
    return () => {
      clearTimeout(timeout);
    };
  }, [lastInlineEditTarget]);

  const value = useMemo(
    () => ({
      isPreview,
      lastInlineEditTarget,
      activatePreview,
      exitPreview,
      requestInlineEdit,
    }),
    [activatePreview, exitPreview, isPreview, lastInlineEditTarget, requestInlineEdit],
  );

  return (
    <AdminPreviewContext.Provider value={value}>
      {children}
      {lastInlineEditTarget && isPreview && (
        <div className="fixed bottom-4 right-4 max-w-sm rounded bg-black/80 px-4 py-3 text-sm text-white shadow-lg">
          <p className="font-semibold">Inline edit ready</p>
          <p className="mt-1 text-xs text-white/80">
            {lastInlineEditTarget.label || 'Selected content'} is ready to edit in preview mode.
          </p>
        </div>
      )}
    </AdminPreviewContext.Provider>
  );
}

export function useAdminPreview(): AdminPreviewContextValue {
  return useContext(AdminPreviewContext);
}

// /admin/login은 admin layout(사이드바)을 사용하지 않고
// 자체 풀스크린 레이아웃으로 렌더링됩니다.
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export type PublishMode = 'draft' | 'public';

export interface PublishResult {
  mode: PublishMode;
  // 用來證明 ModuleRef.get() 拿到的是容器管理的那一份（hook 有跑過）。
  initializedByNest: boolean;
}

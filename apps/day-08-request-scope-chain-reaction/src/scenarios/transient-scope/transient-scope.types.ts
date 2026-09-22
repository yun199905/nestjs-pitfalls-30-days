export interface TransientScopeDemoResponse {
  strategy: 'transient-scope';
  instances: {
    controller: string;
    service: string;
    loggerInController: string;
    loggerInService: string;
  };
}

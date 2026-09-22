import { Module } from '@nestjs/common';
import { ExplicitContextScenarioModule } from './scenarios/explicit-context/explicit-context-scenario.module';
import { RequestScopeScenarioModule } from './scenarios/request-scope/request-scope-scenario.module';
import { TransientScopeScenarioModule } from './scenarios/transient-scope/transient-scope-scenario.module';

@Module({
  imports: [
    RequestScopeScenarioModule,
    ExplicitContextScenarioModule,
    TransientScopeScenarioModule,
  ],
})
export class Day08RequestScopeChainReactionModule {}

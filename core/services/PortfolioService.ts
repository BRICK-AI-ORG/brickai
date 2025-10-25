import { BaseService } from "./BaseService";
import { PortfolioRepository } from "@/core/repositories/PortfolioRepository";
import { PortfolioEntity } from "@/core/domain/entities/PortfolioEntity";
import { TaskRepository } from "@/core/repositories/TaskRepository";
import { TaskEntity } from "@/core/domain/entities/TaskEntity";
import { RepositoryFindOptions } from "@/core/contracts/Repository";
import { Portfolio } from "@/types/models";

export interface PortfolioCreateOptions {
  userId: string;
  name: string;
  description?: string | null;
}

export interface PortfolioUpdateOptions {
  name?: string;
  description?: string | null;
}

export interface PortfolioWithTasks {
  portfolio: PortfolioEntity;
  tasks: TaskEntity[];
}

export class PortfolioService extends BaseService {
  private readonly portfolioRepository: PortfolioRepository;
  private readonly taskRepository: TaskRepository;

  public constructor(
    client: BaseService["client"],
    portfolioRepository = new PortfolioRepository(client),
    taskRepository = new TaskRepository(client)
  ) {
    super(client);
    this.portfolioRepository = portfolioRepository;
    this.taskRepository = taskRepository;
  }

  public async listPortfolios(userId: string): Promise<PortfolioEntity[]> {
    const options: RepositoryFindOptions = {
      filters: { user_id: userId },
      orderBy: { column: "created_at", ascending: true },
    };
    return this.portfolioRepository.findAll(options);
  }

  public async listPortfoliosWithTasks(userId: string): Promise<PortfolioWithTasks[]> {
    const portfolios = await this.listPortfolios(userId);
    if (portfolios.length === 0) {
      return [];
    }

    const portfolioIds = portfolios.map((p) => p.getId());
    const tasks = await this.taskRepository.findAll({
      filters: { portfolio_id: portfolioIds },
      orderBy: { column: "created_at", ascending: false },
    });

    const grouped = new Map<string, TaskEntity[]>();
    portfolioIds.forEach((id) => grouped.set(id, []));
    tasks.forEach((task) => {
      const list = grouped.get(task.getPortfolioId() ?? "");
      if (list) {
        list.push(task);
      }
    });

    return portfolios.map((portfolio) => ({
      portfolio,
      tasks: grouped.get(portfolio.getId()) ?? [],
    }));
  }

  public async createPortfolio(options: PortfolioCreateOptions): Promise<PortfolioEntity> {
    const entity = PortfolioEntity.create({
      userId: options.userId,
      name: options.name,
      description: options.description ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.portfolioRepository.save(entity);
    return entity;
  }

  public async updatePortfolio(portfolioId: string, updates: PortfolioUpdateOptions): Promise<PortfolioEntity> {
    const portfolio = await this.portfolioRepository.findById(portfolioId);
    if (!portfolio) {
      throw new Error("Portfolio not found.");
    }
    if (updates.name !== undefined) {
      portfolio.rename(updates.name);
    }
    if (updates.description !== undefined) {
      portfolio.changeDescription(updates.description ?? null);
    }
    await this.portfolioRepository.save(portfolio);
    return portfolio;
  }

  public async deletePortfolio(portfolioId: string): Promise<void> {
    const portfolio = await this.portfolioRepository.findById(portfolioId);
    if (!portfolio) {
      return;
    }
    await this.portfolioRepository.delete(portfolio);
  }

  public async deletePortfolioTasks(portfolioId: string): Promise<void> {
    const tasks = await this.taskRepository.findAll({ filters: { portfolio_id: portfolioId } });
    await Promise.all(tasks.map((task) => this.taskRepository.delete(task)));
  }

  public toPlain(entity: PortfolioEntity): Portfolio {
    return {
      portfolio_id: entity.getId(),
      user_id: entity.getUserId(),
      name: entity.getName(),
      description: entity.getDescription(),
      created_at: entity.getCreatedAt()?.toISOString() ?? null,
      updated_at: entity.getUpdatedAt()?.toISOString() ?? null,
    } as Portfolio;
  }
}

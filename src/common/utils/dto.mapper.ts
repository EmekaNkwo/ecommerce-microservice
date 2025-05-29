// src/common/utils/dto.mapper.ts
import { plainToInstance } from 'class-transformer';

export class DtoMapper {
  static toDto<T, V extends Record<string, any>>(
    dtoClass: new () => T,
    entity: V,
    excludeFields: string[] = ['password'],
  ): T {
    const filteredEntity: Record<string, any> = {};
    Object.keys(entity).forEach((key) => {
      if (!excludeFields.includes(key)) {
        filteredEntity[key] = entity[key];
      }
    });
    return plainToInstance(dtoClass, filteredEntity);
  }

  static toDtoArray<T, V extends Record<string, any>>(
    dtoClass: new () => T,
    entities: V[],
    excludeFields: string[] = ['password'],
  ): T[] {
    return entities.map((entity) =>
      this.toDto(dtoClass, entity, excludeFields),
    );
  }
}

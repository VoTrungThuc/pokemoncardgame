package com.pokemon.marketplace.config;

import com.pokemon.marketplace.service.SequenceGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertCallback;
import org.springframework.stereotype.Component;
import java.lang.reflect.Field;

@Component
public class SequenceGeneratorCallback implements BeforeConvertCallback<Object> {

    private final SequenceGeneratorService sequenceGenerator;

    public SequenceGeneratorCallback(@org.springframework.context.annotation.Lazy SequenceGeneratorService sequenceGenerator) {
        this.sequenceGenerator = sequenceGenerator;
    }

    @Override
    public Object onBeforeConvert(Object entity, String collection) {
        if (entity instanceof com.pokemon.marketplace.entity.Product) {
            ((com.pokemon.marketplace.entity.Product) entity).calculateScore();
        }
        try {
            Field idField = getField(entity.getClass(), "id");
            if (idField != null) {
                idField.setAccessible(true);
                Object value = idField.get(entity);
                if (value == null || (value instanceof Long && (Long) value == 0L)) {
                    long seqValue = sequenceGenerator.generateSequence(collection + "_sequence");
                    idField.set(entity, seqValue);
                }
            }
        } catch (Exception e) {
            // Log or ignore
        }
        return entity;
    }

    private Field getField(Class<?> clazz, String fieldName) {
        try {
            return clazz.getDeclaredField(fieldName);
        } catch (NoSuchFieldException e) {
            Class<?> superClass = clazz.getSuperclass();
            if (superClass != null) {
                return getField(superClass, fieldName);
            }
        }
        return null;
    }
}

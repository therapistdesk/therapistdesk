import { useEffect, useRef } from 'react';
import Button from "../common/Button";
import ServiceForm from "./ServiceForm";

export default function CategoryCard({
    category,
    onChange,
    onAddService,
    autoFocus,
    onUpdateService,
    onCategoryRemove,
    onServiceRemove,
    usedColors,
}) {
    const inputRef = useRef(null);
    useEffect(() => {
        if (!autoFocus) {
            return;
        }

        inputRef.current?.focus();

        inputRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }, [autoFocus]);

    return (
        <div
            style={{
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
            }}
        >
            <input
                type="text"
                value={category.name}
                onChange={(e) =>
                    onChange(
                        category.id,
                        'name',
                        e.target.value,
                    )
                }
                ref={inputRef}
                style={{
                    width: '100%',
                    fontSize: 18,
                    fontWeight: 'bold',
                    padding: '8px 10px',
                    marginBottom: 12,
                    boxSizing: 'border-box',
                }}
            />

            <div style={{ marginTop: 12 }}>
                {/* {category.services?.map((service) => (
                    <div
                        key={service.id}
                        style={{
                            borderTop: '1px solid #eee',
                            padding: '10px 0',
                        }}
                    >
                        <div>
                            <strong>{service.name}</strong>
                        </div>

                        <div>
                            {service.defaultDurationMinutes} min
                        </div>

                        <div>
                            {service.defaultPrice} {service.currency}
                        </div>

                        <div>
                            {service.description}
                        </div>
                    </div>
                ))} */}

                {category.services?.map((service) => (
                    <ServiceForm
                        key={service.id}
                        service={service}
                        categoryId={category.id}
                        onChange={onUpdateService}
                        usedColors={usedColors}
                        onRemove={onServiceRemove}
                    />
                ))}

                <div style={{ marginTop: '10px' }}>
                    <Button
                        type="button"
                        onClick={() => onAddService(category.id)}
                    >
                        + Add Service
                    </Button>
                </div>
                <Button
                    variant="danger"
                    onClick={() => onCategoryRemove(category.id)}
                >
                    Delete Category
                </Button>

                {category.services?.length === 0 && (
                    <div style={{ color: '#777' }}>
                        No services
                    </div>
                )}
            </div>
        </div>
    );
}
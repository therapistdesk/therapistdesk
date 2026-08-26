import { useEffect, useRef, useState } from 'react';

import Button from '../common/Button';
import SaveStatus from '../common/SaveStatus';

import CategoryCard from './CategoryCard';
import ServiceCard from './ServiceForm';
import {
    getNextServiceColor,
    getUsedServiceColors,
} from "../../register/RegisterHelpers";

export default function SettingsServices({
    settings,
    loadSettings,
}) {
    const [editedCategories, setEditedCategories] = useState([]);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const nextTempCategoryId = useRef(-1);
    const nextTempServiceId = useRef(-1);

    useEffect(() => {
        if (settings?.categories) {
            setEditedCategories(
                structuredClone(settings.categories)
            );
        }
    }, [settings]);

    const isDirty = () => {
        return (
            JSON.stringify(editedCategories) !==
            JSON.stringify(settings?.categories ?? [])
        );
    };

    const handleCancel = () => {
        setEditedCategories(
            structuredClone(settings.categories)
        );

        setMessage('');
        setError('');
    };

    const handleCategoryChange = (categoryId, field, value) => {
        setEditedCategories(categories =>
            categories.map(category =>
                category.id === categoryId
                    ? {
                        ...category,
                        [field]: value,
                    }
                    : category
            )
        );
    };

    const handleAddCategory = () => {
        setEditedCategories((current) => {
            const newCategory = {
                id: nextTempCategoryId.current--,
                name: '',
                description: null,
                color: '#4CAF50',
                sortOrder: current.length,
                isActive: true,
                services: [],
                isNew: true,
            };

            return [...current, newCategory];
        });
    };

    const handleUpdateService = (categoryId, serviceId, field, value) => {
        setEditedCategories((categories) =>
            categories.map((category) =>
                category.id !== categoryId
                    ? category
                    : {
                        ...category,
                        services: category.services.map((service) =>
                            service.id !== serviceId
                                ? service
                                : {
                                    ...service,
                                    [field]: value,
                                }
                        ),
                    }
            )
        );
    };

    const handleServiceRemove = (categoryId, serviceId) => {
        setEditedCategories(categories =>
            categories.map(category =>
                category.id !== categoryId
                    ? category
                    : {
                        ...category,
                        services: category.services.filter(
                            service => service.id !== serviceId
                        ),
                    }
            )
        );
    };

    function handleAddService(categoryId) {
        const categoryIndex = editedCategories.findIndex(
            category => category.id === categoryId
        );

        if (categoryIndex === -1) {
            return;
        }
        const newService = {
            id: nextTempServiceId.current--,
            isNew: true,

            name: "",
            description: "",

            defaultDurationMinutes: 60,
            defaultPrice: 0,
            currency: "Euro",

            color: getNextServiceColor({
                categories: editedCategories,
            }),

            isActive: true,
        };

        // console.log(newService);
        // console.log(
        //     "Category found:",
        //     editedCategories[categoryIndex].name
        // );

        setEditedCategories(categories =>
            categories.map(category =>
                category.id === categoryId
                    ? {
                        ...category,
                        services: [...category.services, newService],
                    }
                    : category
            )
        );
    }

    const handleCategoryRemove = (categoryId) => {
        setEditedCategories((categories) =>
            categories.filter(
                (category) => category.id !== categoryId,
            ),
        );
    };

    const handleSave = async () => {
        const payload = {
            categories: editedCategories.map((category) => ({
                id: category.id,
                name: category.name,
                description: category.description,
                color: category.color,
                sortOrder: category.sortOrder,
                isActive: category.isActive,

                services: category.services.map((service) => ({
                    id: service.id,
                    name: service.name,
                    description: service.description,
                    defaultDurationMinutes: service.defaultDurationMinutes,
                    defaultPrice: service.defaultPrice,
                    currency: service.currency,
                    color: service.color,
                    isActive: service.isActive,
                })),
            })),
        };

        const token = localStorage.getItem("token");

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/settings/services`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            }
        );

        // console.log(response.status);

        const error = await response.text();
        console.log(error);

        await loadSettings();
    };

    // console.log("ddd");
    // console.log(editedCategories);

    return (
        <>
            <h3
                style={{
                    margin: 0,
                    textAlign: "left",
                }}
            >
                🧠 Therapeutic Approaches & Services
            </h3>

            <SaveStatus
                message={message}
                error={error}
            />
            <Button
                onClick={handleAddCategory}
            >
                Add Category
            </Button>
            <div style={{ marginTop: 20 }}>
                {editedCategories.map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        onChange={handleCategoryChange}
                        onAddService={handleAddService}
                        autoFocus={category.isNew === true}
                        onCategoryRemove={handleCategoryRemove}
                        onUpdateService={handleUpdateService}
                        onServiceRemove={handleServiceRemove}
                        usedColors={getUsedServiceColors({
                            categories: editedCategories,
                        })}
                    />
                ))}
            </div>

            <div
                style={{
                    marginTop: 20,
                    display: 'flex',
                    gap: 10,
                }}
            >

                <Button
                    onClick={handleSave}
                    disabled={!isDirty() || saving}
                >
                    💾 Save
                </Button>

                <Button
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={saving}
                >
                    Cancel
                </Button>
            </div>
        </>
    );
}
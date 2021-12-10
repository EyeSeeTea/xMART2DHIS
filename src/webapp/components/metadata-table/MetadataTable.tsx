import { Checkbox, FormControlLabel, makeStyles } from "@material-ui/core";
import { isCancel } from "@eyeseetea/d2-api";
import {
    ObjectsTable,
    ObjectsTableDetailField,
    ObjectsTableProps,
    ReferenceObject,
    TableAction,
    TableColumn,
    TablePagination,
    TableSelection,
    TableState,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { ChangeEvent, ReactNode, useCallback, useEffect, useState } from "react";
import { MetadataType } from "../../../utils/d2";
import { D2Model } from "../../../domain/entities/models/D2Model";
import { useAppContext } from "../../contexts/app-context";
import { ProgramModel } from "../../../domain/entities/models/D2Models";
import { ListMetadataOptions } from "../../../domain/repositories/MetadataRepository";
import i18n from "../../../locales";
import { Dropdown } from "../dropdown/Dropdown";

export interface MetadataTableProps extends Omit<ObjectsTableProps<MetadataType>, "rows" | "columns"> {
    filterRows?: string[];
    transformRows?: (rows: MetadataType[]) => MetadataType[];
    models: typeof D2Model[];
    selectedIds?: string[];
    excludedIds?: string[];
    childrenKeys?: string[];
    initialShowOnlySelected?: boolean;
    additionalColumns?: TableColumn<MetadataType>[];
    additionalActions?: TableAction<MetadataType>[];
    showIndeterminateSelection?: boolean;
    notifyNewSelection?(selectedIds: string[], excludedIds: string[]): void;
    notifyNewModel?(model: typeof D2Model): void;
    notifyRowsChange?(rows: MetadataType[]): void;
    externalFilterComponents?: ReactNode;
}

const useStyles = makeStyles({
    checkbox: {
        paddingLeft: 10,
        marginTop: 8,
    },
    metadataFilter: {
        order: 1,
    },
    modelFilter: {
        order: 2,
        marginTop: -8,
        marginLeft: 10,
    },
    onlySelectedFilter: {
        order: 5,
    },
});

const initialState = {
    sorting: {
        field: "displayName" as const,
        order: "asc" as const,
    },
    pagination: {
        page: 1,
        pageSize: 25,
    },
};

const uniqCombine = (items: any[]) => {
    return _(items).compact().reverse().uniqBy("name").reverse().value();
};

const MetadataTable: React.FC<MetadataTableProps> = ({
    filterRows,
    transformRows = rows => rows,
    models,
    selectedIds: externalSelection,
    excludedIds = [],
    notifyNewSelection = _.noop,
    notifyNewModel = _.noop,
    notifyRowsChange = _.noop,
    childrenKeys = [],
    additionalColumns = [],
    additionalActions = [],
    loading: providedLoading,
    initialShowOnlySelected = false,
    showIndeterminateSelection = false,
    externalFilterComponents,
    ...rest
}) => {
    const { compositionRoot } = useAppContext();
    const classes = useStyles();

    const snackbar = useSnackbar();

    const [model, updateModel] = useState<typeof D2Model>(() => models[0] ?? ProgramModel);
    //const [ids, updateIds] = useState<string[]>([]);

    const [stateSelection, setStateSelection] = useState<string[]>(externalSelection ?? []);
    const [showOnlySelected, setShowOnlySelected] = useState<boolean>(initialShowOnlySelected);
    const selectedIds = externalSelection ?? stateSelection;
    const [filters, setFilters] = useState<ListMetadataOptions>({
        model: model.getCollectionName(),
        order: initialState.sorting,
        page: initialState.pagination.page,
        pageSize: initialState.pagination.pageSize,
        disableFilterRows: false,
        ...model.getApiModelFilters(),
    });

    const updateFilters = useCallback(
        (partialFilters: Partial<ListMetadataOptions>) => {
            setFilters(state => ({ ...state, page: 1, ...partialFilters }));
        },
        [setFilters]
    );

    const [rows, setRows] = useState<MetadataType[]>([]);
    const [pager, setPager] = useState<Partial<TablePagination>>({});
    const [loading, setLoading] = useState<boolean>(true);

    const changeModelFilter = (modelName: string) => {
        if (models.length === 0) throw new Error("You need to provide at least one model");
        const model = _.find(models, model => model.getMetadataType() === modelName) ?? models[0] ?? ProgramModel;
        setRows([]);
        updateModel(() => model);

        notifyNewModel(model);

        updateFilters({
            model: model.getCollectionName(),
            ...model.getApiModelFilters(),
        });
    };

    const changeSearchFilter = (value: string) => {
        const hasSearch = value.trim() !== "";
        updateFilters({
            search: hasSearch ? value : undefined,
        });
    };

    const changeOnlySelectedFilter = (event: ChangeEvent<HTMLInputElement>) => {
        const showOnlySelected = event.target?.checked;
        setShowOnlySelected(showOnlySelected);
    };

    const addToSelection = (ids: string[]) => {
        const oldSelection = _.difference(selectedIds, ids);
        const newSelection = _.difference(ids, selectedIds);

        notifyNewSelection([...oldSelection, ...newSelection], excludedIds);
    };

    const filterComponents = (
        <React.Fragment key={"metadata-table-filters"}>
            {externalFilterComponents}

            {models.length > 1 && (
                <div className={classes.metadataFilter}>
                    <Dropdown
                        className={classes.modelFilter}
                        items={models.map(model => ({
                            id: model.getMetadataType(),
                            name: model.getModelName(),
                        }))}
                        onValueChange={changeModelFilter}
                        value={model.getMetadataType()}
                        label={i18n.t("Metadata type")}
                        hideEmpty={true}
                    />
                </div>
            )}

            {
                <div className={classes.onlySelectedFilter}>
                    <FormControlLabel
                        className={classes.checkbox}
                        control={<Checkbox checked={showOnlySelected} onChange={changeOnlySelectedFilter} />}
                        label={i18n.t("Only selected items")}
                    />
                </div>
            }
        </React.Fragment>
    );

    const handleError = useCallback(
        (error: string) => {
            if (!isCancel(error)) {
                snackbar.error(error);
                setRows([]);
                setPager({});
                setLoading(false);
            }
        },
        [snackbar]
    );

    const tableActions = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            type: "details",
        },
        {
            name: "select",
            text: i18n.t("Select"),
            primary: true,
            multiple: true,
            onClick: addToSelection,
            isActive: () => false,
        },
    ];

    useEffect(() => {
        const fields = model.getFields();

        setLoading(true);
        compositionRoot.metadata
            .list({ ...filters, selectedIds: showOnlySelected ? selectedIds : [], fields })
            .run(({ objects, pager }) => {
                const rows = model.getApiModelTransform()(objects as unknown as MetadataType[]);

                notifyRowsChange(rows);

                setRows(rows);
                setPager(pager);
                setLoading(false);
            }, handleError);
    }, [compositionRoot, notifyRowsChange, filters, filterRows, model, handleError, selectedIds, showOnlySelected]);

    const handleTableChange = (tableState: TableState<ReferenceObject>) => {
        const { sorting, pagination, selection } = tableState;

        const included = _.reject(selection, { indeterminate: true }).map(({ id }) => id);
        const newlySelectedIds = _.difference(included, selectedIds);
        const newlyUnselectedIds = _.difference(selectedIds, included);

        const parseChildren = (ids: string[]) =>
            _(rows)
                .filter(({ id }) => !!ids.includes(id))
                .map(row => _.values(_.pick(row, childrenKeys)) as unknown as MetadataType)
                .flattenDeep()
                .map(({ id }) => id)
                .value();

        const excluded = _(excludedIds)
            .union(newlyUnselectedIds)
            .difference(parseChildren(newlyUnselectedIds))
            .difference(newlySelectedIds)
            .difference(parseChildren(newlySelectedIds))
            .filter(id => !_.find(rows, { id }))
            .value();

        if (!_.isEqual(stateSelection, included)) {
            notifyNewSelection(included, excluded);
        }

        setStateSelection(included);
        updateFilters({
            sorting,
            page: pagination.page,
            pageSize: pagination.pageSize,
        });
    };

    const exclusion = excludedIds.map(id => ({ id }));
    const selection = selectedIds.map(id => ({
        id,
        checked: true,
        indeterminate: false,
    }));

    const childrenSelection: TableSelection[] = showIndeterminateSelection
        ? _(rows)
              .intersectionBy(selection, "id")
              .map(row => _.values(_.pick(row, childrenKeys)) as unknown as MetadataType[])
              .flattenDeep()
              .differenceBy(selection, "id")
              .differenceBy(exclusion, "id")
              .map(({ id }) => {
                  return {
                      id,
                      checked: true,
                      indeterminate: !_.find(selection, { id }),
                  };
              })
              .value()
        : [];

    const columns: TableColumn<MetadataType>[] = uniqCombine(_.compact([...model.getColumns(), ...additionalColumns]));

    const details: ObjectsTableDetailField<MetadataType>[] = uniqCombine([...model.getDetails()]);

    const actions: TableAction<MetadataType>[] = uniqCombine([...tableActions, ...additionalActions]);

    return (
        <React.Fragment>
            <ObjectsTable<MetadataType>
                rows={transformRows(rows)}
                columns={columns}
                details={details}
                onChangeSearch={changeSearchFilter}
                initialState={initialState}
                searchBoxLabel={i18n.t(`Search by `) + model.getSearchFilter().field}
                pagination={pager}
                onChange={handleTableChange}
                //ids={ids}
                loading={providedLoading || loading}
                selection={[...selection, ...childrenSelection]}
                childrenKeys={childrenKeys}
                filterComponents={filterComponents}
                forceSelectionColumn={true}
                actions={actions}
                {...rest}
            />
        </React.Fragment>
    );
};

export default MetadataTable;

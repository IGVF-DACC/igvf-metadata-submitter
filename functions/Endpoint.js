/* All endpoint-specific data

ALL_ENCODE_PROFILES parsed from https://www.encodeproject.org/profiles/?format=json
- Schema version 36 (snapshotted at 09/21/2022)

ALL_IGVF_PROFILES parsed from https://github.com/IGVF-DACC/igvfd/tree/dev/src/igvfd/schemas
- Schema version 2 (snapshotted at 01/17/2023)
*/

const ENCODE = "ENCODE";
const IGVF = "IGVF";

const PROPERTY_DEFAULT_ENDPOINT_READ = "defaultEndpointRead";
const PROPERTY_DEFAULT_ENDPOINT_WRITE = "defaultEndpointWrite";

const ENDPOINT_ENCODE_PROD = "https://www.encodeproject.org";
const ENDPOINT_ENCODE_TEST = "https://test.encodedcc.org";
const ENDPOINT_IGVF_PROD = "https://igvfd-dev.demo.igvf.org";
const ENDPOINT_IGVF_TEST = "https://igvfd-dev.demo.igvf.org";
const ENCODE_ENDPOINTS = [ENDPOINT_ENCODE_PROD, ENDPOINT_ENCODE_TEST];
const IGVF_ENDPOINTS = [ENDPOINT_IGVF_PROD, ENDPOINT_IGVF_TEST];
const ALL_ENDPOINTS = ENCODE_ENDPOINTS.concat(IGVF_ENDPOINTS);

// adhoc fix to have different endpoint for REST and Search on IGVF
const ENDPOINT_IGVF_SEARCH_UI = "https://igvf-ui-dev.demo.igvf.org"

const DEFAULT_ENDPOINT_READ = ENDPOINT_ENCODE_PROD;
const DEFAULT_ENDPOINT_WRITE = ENDPOINT_ENCODE_TEST;

const ALL_ENCODE_PROFILES = [
  "award",
  "document",
  "lab",
  "library",
  "organism",
  "platform",
  "publication",
  "software",
  "software_version",
  "source",
  "treatment",
  "access_key_admin",
  "analysis",
  "quality_standard",
  "antibody_lot",
  "biosample",
  "biosample_type",
  "cart",
  "antibody_characterization",
  "biosample_characterization",
  "donor_characterization",
  "genetic_modification_characterization",
  "aggregate_series",
  "annotation",
  "collection_series",
  "computational_model",
  "differential_accessibility_series",
  "differentiation_series",
  "disease_series",
  "experiment_series",
  "functional_characterization_series",
  "gene_silencing_series",
  "matched_set",
  "multiomics_series",
  "organism_development_series",
  "project",
  "publication_data",
  "pulse_chase_time_series",
  "reference",
  "reference_epigenome",
  "replication_timing_series",
  "single_cell_rna_series",
  "single_cell_unit",
  "treatment_concentration_series",
  "treatment_time_series",
  "ucsc_browser_composite",
  "fly_donor",
  "human_donor",
  "manatee_donor",
  "mouse_donor",
  "worm_donor",
  "experiment",
  "replicate",
  "file",
  "functional_characterization_experiment",
  "gene",
  "genetic_modification",
  "image",
  "page",
  "analysis_step",
  "analysis_step_run",
  "analysis_step_version",
  "pipeline",
  "atac_alignment_enrichment_quality_metric",
  "atac_alignment_quality_metric",
  "atac_library_complexity_quality_metric",
  "atac_peak_enrichment_quality_metric",
  "atac_replication_quality_metric",
  "bismark_quality_metric",
  "bpnet_quality_metric",
  "bru_library_quality_metric",
  "chia_pet_alignment_quality_metric",
  "chia_pet_chr_interactions_quality_metric",
  "chia_pet_peak_enrichment_quality_metric",
  "chip_alignment_enrichment_quality_metric",
  "chip_alignment_samstat_quality_metric",
  "chip_library_quality_metric",
  "chip_peak_enrichment_quality_metric",
  "chip_replication_quality_metric",
  "chipseq_filter_quality_metric",
  "complexity_xcorr_quality_metric",
  "correlation_quality_metric",
  "cpg_correlation_quality_metric",
  "dnase_alignment_quality_metric",
  "dnase_footprinting_quality_metric",
  "duplicates_quality_metric",
  "edwbamstats_quality_metric",
  "filtering_quality_metric",
  "gembs_alignment_quality_metric",
  "gencode_category_quality_metric",
  "gene_quantification_quality_metric",
  "gene_type_quantification_quality_metric",
  "generic_quality_metric",
  "hic_quality_metric",
  "histone_chipseq_quality_metric",
  "hotspot_quality_metric",
  "idr_quality_metric",
  "idr_summary_quality_metric",
  "long_read_rna_mapping_quality_metric",
  "long_read_rna_quantification_quality_metric",
  "mad_quality_metric",
  "micro_rna_mapping_quality_metric",
  "micro_rna_quantification_quality_metric",
  "samtools_flagstats_quality_metric",
  "samtools_stats_quality_metric",
  "sc_atac_alignment_quality_metric",
  "sc_atac_analysis_quality_metric",
  "sc_atac_counts_summary_quality_metric",
  "sc_atac_library_complexity_quality_metric",
  "sc_atac_multiplet_quality_metric",
  "sc_atac_read_quality_metric",
  "scrna_seq_counts_summary_quality_metric",
  "segway_quality_metric",
  "star_quality_metric",
  "star_solo_quality_metric",
  "trimming_quality_metric",
  "rna_expression",
  "target",
  "transgenic_enhancer_experiment",
  "user"
];
const ALL_IGVF_PROFILES = [
  "access_key",
  "analysis_set",
  "assay_term",
  "award",
  "biomarker",
  "biosample",
  "cell_line",
  "curated_set",
  "differentiated_cell",
  "differentiated_tissue",
  "document",
  "donor",
  "file",
  "file_set",
  "gene",
  "human_donor",
  "human_genomic_variant",
  "image",
  "in_vitro_system",
  "lab",
  "measurement_set",
  "mixins",
  "namespaces",
  "ontology_term",
  "page",
  "phenotype_term",
  "phenotypic_feature",
  "primary_cell",
  "publication",
  "reference_data",
  "rodent_donor",
  "sample",
  "sample_term",
  "sequence_data",
  "software",
  "software_version",
  "source",
  "technical_sample",
  "tissue",
  "treatment",
  "user",
  "variant",
  "whole_organism",
];

function isEncodeEndpoint(endpoint) {
  return ENCODE_ENDPOINTS.includes(endpoint);
}

function isIgvfEndpoint(endpoint) {
  return IGVF_ENDPOINTS.includes(endpoint);
}

function isValidEndpoint(endpoint) {
  return ALL_ENDPOINTS.includes(endpoint);
}

function isEncodeUrl(url) {
  return ENCODE_ENDPOINTS.some(endpoint => {
    if(url.startsWith(endpoint)) {
      return true;
    }
  });
}

function isIgvfUrl(url) {
  return IGVF_ENDPOINTS.some(endpoint => {
    if(url.startsWith(endpoint)) {
      return true;
    }
  });
}

function getServerFromUrl(url) {
  if (isEncodeUrl(url)) {
    return ENCODE;
  } else if (isIgvfUrl(url)) {
    return IGVF;
  }
}

function getAllProfiles(endpoint) {
  if (isEncodeEndpoint(endpoint)) {
    return ALL_ENCODE_PROFILES;
  } else if (isIgvfEndpoint(endpoint)) {
    return ALL_IGVF_PROFILES;
  }
}

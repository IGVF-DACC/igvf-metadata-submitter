/* All endpoint-specific data


ALL_ENCODE_PROFILES from the following command line (snapshotted at 05/23/2022)

curl "https://www.encodeproject.org/profiles/?format=json&frame=object" \
  | jq | perl -ne '/\/profiles\/(.+).json/ and print "  \"$1\",\n";' | sort | uniq


ALL_IGVF_PROFILES from "ORDER" array in the following file (snapshotted at 09/27/2023)
It's an ordered list of profiles:
  https://github.com/IGVF-DACC/igvfd/blob/dev/src/igvfd/loadxl.py#L15

Double-check it with profiles retrieved with the following command line

curl "https://api.data.igvf.org/profiles?format=json&frame=object" \
  | jq | perl -ne '/\/profiles\/(.+).json/ and print "  \"$1\",\n";' | sort | uniq

*/

const ENCODE = "ENCODE";
const IGVF = "IGVF";

// These are API endpoints.
// If there is a UI endpoint then add it to ENDPOINT_MAP_API_TO_UI below
// Otherwise, the script will use the same endpoint for API and UI

const ENDPOINT_ENCODE_PROD = "https://www.encodeproject.org";
const ENDPOINT_ENCODE_TEST = "https://test.encodedcc.org";
const ENCODE_ENDPOINTS = [
  ENDPOINT_ENCODE_PROD,
  ENDPOINT_ENCODE_TEST,
];

const ENDPOINT_IGVF_TEST = "https://igvfd-dev.demo.igvf.org";
const ENDPOINT_IGVF_SANDBOX = "https://api.sandbox.igvf.org";
const ENDPOINT_IGVF_STAGING = "https://api.staging.igvf.org";
const ENDPOINT_IGVF_DATA = "https://api.data.igvf.org";
const IGVF_ENDPOINTS = [
  ENDPOINT_IGVF_TEST,
  ENDPOINT_IGVF_SANDBOX,
  ENDPOINT_IGVF_STAGING,
  ENDPOINT_IGVF_DATA,
];

const DEFAULT_ENDPOINT_READ = ENDPOINT_IGVF_SANDBOX;
const DEFAULT_ENDPOINT_WRITE = ENDPOINT_IGVF_SANDBOX;

const ALL_ENDPOINTS = [
  ...ENCODE_ENDPOINTS,
  ...IGVF_ENDPOINTS,
];

// Mapping from API to UI
// Define only if API and UI endpoints are different
const ENDPOINT_MAP_API_TO_UI = {
  "https://igvfd-dev.demo.igvf.org": "https://igvf-ui-dev.demo.igvf.org",
  "https://api.sandbox.igvf.org" : "https://sandbox.igvf.org",
  "https://api.staging.igvf.org" : "https://staging.igvf.org",
  "https://api.data.igvf.org" : "https://data.igvf.org",
};

const ALL_ENCODE_PROFILES = [
  "access_key_admin",
  "aggregate_series",
  "analysis",
  "analysis_step",
  "analysis_step_run",
  "analysis_step_version",
  "annotation",
  "antibody_characterization",
  "antibody_lot",
  "atac_alignment_enrichment_quality_metric",
  "atac_alignment_quality_metric",
  "atac_library_complexity_quality_metric",
  "atac_peak_enrichment_quality_metric",
  "atac_replication_quality_metric",
  "award",
  "biosample",
  "biosample_characterization",
  "biosample_type",
  "bismark_quality_metric",
  "bpnet_quality_metric",
  "bru_library_quality_metric",
  "cart",
  "chia_pet_alignment_quality_metric",
  "chia_pet_chr_interactions_quality_metric",
  "chia_pet_peak_enrichment_quality_metric",
  "chip_alignment_enrichment_quality_metric",
  "chip_alignment_samstat_quality_metric",
  "chip_library_quality_metric",
  "chip_peak_enrichment_quality_metric",
  "chip_replication_quality_metric",
  "chipseq_filter_quality_metric",
  "collection_series",
  "complexity_xcorr_quality_metric",
  "computational_model",
  "correlation_quality_metric",
  "cpg_correlation_quality_metric",
  "differential_accessibility_series",
  "differentiation_series",
  "disease_series",
  "dnase_alignment_quality_metric",
  "dnase_footprinting_quality_metric",
  "document",
  "donor_characterization",
  "duplicates_quality_metric",
  "edwbamstats_quality_metric",
  "experiment",
  "experiment_series",
  "file",
  "filtering_quality_metric",
  "fly_donor",
  "functional_characterization_experiment",
  "functional_characterization_series",
  "gembs_alignment_quality_metric",
  "gencode_category_quality_metric",
  "gene",
  "gene_quantification_quality_metric",
  "generic_quality_metric",
  "gene_silencing_series",
  "genetic_modification",
  "genetic_modification_characterization",
  "gene_type_quantification_quality_metric",
  "hic_quality_metric",
  "histone_chipseq_quality_metric",
  "hotspot_quality_metric",
  "human_donor",
  "idr_quality_metric",
  "idr_summary_quality_metric",
  "image",
  "lab",
  "library",
  "long_read_rna_mapping_quality_metric",
  "long_read_rna_quantification_quality_metric",
  "mad_quality_metric",
  "manatee_donor",
  "matched_set",
  "micro_rna_mapping_quality_metric",
  "micro_rna_quantification_quality_metric",
  "mouse_donor",
  "multiomics_series",
  "organism",
  "organism_development_series",
  "page",
  "pipeline",
  "platform",
  "project",
  "publication",
  "publication_data",
  "pulse_chase_time_series",
  "quality_standard",
  "reference",
  "reference_epigenome",
  "replicate",
  "replication_timing_series",
  "rna_expression",
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
  "single_cell_rna_series",
  "single_cell_unit",
  "software",
  "software_version",
  "source",
  "star_quality_metric",
  "star_solo_quality_metric",
  "target",
  "transgenic_enhancer_experiment",
  "treatment",
  "treatment_concentration_series",
  "treatment_time_series",
  "trimming_quality_metric",
  "ucsc_browser_composite",
  "user",
  "worm_donor",
];
const CORE_SET_ENCODE_PROFILES = [
  "experiment",
];

const ALL_IGVF_PROFILES = [
  "user",
  "award",
  "source",
  "lab",
  "document",
  "gene",
  "sample_term",
  "assay_term",
  "phenotype_term",
  "platform_term",
  "phenotypic_feature",
  "human_donor",
  "rodent_donor",
  "treatment",
  "modification",
  "human_genomic_variant",
  "biomarker",
  "tissue",
  "in_vitro_system",
  "primary_cell",
  "technical_sample",
  "whole_organism",
  "multiplexed_sample",
  "curated_set",
  "software",
  "software_version",
  "construct_library",
  "construct_library_set",
  "image",
  "page",
  "workflow",
  "publication",
  "access_key",
  "measurement_set",
  "analysis_set",
  "model",
  "model_set",
  "auxiliary_set",
  "prediction",
  "prediction_set",
  "reference_file",
  "sequence_file",
  "signal_file",
  "alignment_file",
  "configuration_file",
  "matrix_file",
  "analysis_step"
];

const IGVF_PROFILES_EXCLUSION_LIST_FOR_TEMPLATE_GENERATION = [
  "access_key",
  "award",
  "lab",
  "gene",
  "assay_term",
  "phenotype_term",
  "platform_term",
  "sample_term",
  "page",
  "source",
  "user",
  "human_genomic_variant",
  "construct_library",
  "prediction",
  "model",
];

const CORE_SET_IGVF_PROFILES = [
  "document",
  "measurement_set",
  "sequence_file",
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

function getUIEndpoint(endpoint) {
  if (ENDPOINT_MAP_API_TO_UI.hasOwnProperty(endpoint)) {
    return ENDPOINT_MAP_API_TO_UI[endpoint];
  }
  return endpoint;
}

function getIgvfEndpointsAvailableForUsers() {
  // hide ENDPOINT_IGVF_TEST from users
  return IGVF_ENDPOINTS.filter(e => e !== ENDPOINT_IGVF_TEST);
}

function getAllProfilesForTemplateGeneration(endpoint) {
  if (isEncodeEndpoint(endpoint)) {
    return ALL_ENCODE_PROFILES;
  } else if (isIgvfEndpoint(endpoint)) {
    // apply exclusion list for igvf profiles
    return ALL_IGVF_PROFILES
      .filter(item => !IGVF_PROFILES_EXCLUSION_LIST_FOR_TEMPLATE_GENERATION.includes(item));
  }
}